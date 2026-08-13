import os
import json
import cv2
import numpy as np
import tensorflow as tf
from abc import ABC, abstractmethod
import logging

logger = logging.getLogger("ModelAdapters")

class BaseModelAdapter(ABC):
    """
    Abstract base class for facial feature model adapters.
    Provides standard interfaces for loading, preprocessing, and running inference.
    """
    def __init__(self, model_dir: str, name: str, input_shape: tuple):
        self.model_dir = model_dir
        self.name = name
        self.input_shape = input_shape
        self.model = None
        self.load_model()

    def _clean_config_json(self, config_json: str) -> str:
        """Helper to recursively remove unsupported config keys like quantization_config."""
        try:
            config_dict = json.loads(config_json)
            
            def remove_key_recursive(d, key_to_remove):
                if isinstance(d, dict):
                    if key_to_remove in d:
                        del d[key_to_remove]
                    for k, v in list(d.items()):
                        remove_key_recursive(v, key_to_remove)
                elif isinstance(d, list):
                    for item in d:
                        remove_key_recursive(item, key_to_remove)
                        
            remove_key_recursive(config_dict, "quantization_config")
            return json.dumps(config_dict)
        except Exception as e:
            logger.warning(f"Failed to pre-clean model config JSON: {e}")
            return config_json

    def load_model(self):
        """Loads model config and weights using Keras/TensorFlow."""
        config_path = os.path.join(self.model_dir, "config.json")
        weights_path = os.path.join(self.model_dir, "model.weights.h5")
        
        if not os.path.exists(config_path) or not os.path.exists(weights_path):
            raise FileNotFoundError(f"Model files not found in directory: {self.model_dir}")
            
        with open(config_path, "r") as f:
            config_json = f.read()
            
        # Clean config JSON to resolve version conflicts (e.g. quantization_config)
        config_json = self._clean_config_json(config_json)
            
        try:
            # In Keras 3 / TensorFlow 2.16+, model_from_json is the standard way to load model configurations
            self.model = tf.keras.models.model_from_json(config_json)
            self.model.load_weights(weights_path)
            logger.info(f"Model '{self.name}' successfully loaded config and weights.")
        except Exception as e:
            try:
                # Standalone Keras fallback
                import keras
                self.model = keras.models.model_from_json(config_json)
                self.model.load_weights(weights_path)
                logger.info(f"Model '{self.name}' successfully loaded using standalone Keras.")
            except Exception as e2:
                logger.error(f"Failed to load model '{self.name}': {e} | {e2}")
                raise RuntimeError(f"Failed to load model {self.name}: {e2}")

    def preprocess(self, crop_image: np.ndarray) -> np.ndarray:
        """
        Resizes input crop image to the expected input shape.
        Note: The models include a built-in Rescaling layer (scale=1/255.0),
        so we pass standard uint8 pixel values [0-255] cast to float32.
        """
        # Resize to input shape (width, height)
        resized = cv2.resize(crop_image, self.input_shape, interpolation=cv2.INTER_AREA)
        # Ensure BGR to RGB (MediaPipe outputs BGR or RGB depending on cv2 reading,
        # Keras models are trained on standard RGB channels)
        # Keep channel ordering consistent
        resized_rgb = cv2.cvtColor(resized, cv2.COLOR_BGR2RGB)
        # Add batch dimension [1, H, W, C]
        batch_img = np.expand_dims(resized_rgb.astype(np.float32), axis=0)
        return batch_img

    def predict(self, crop_image: np.ndarray) -> dict:
        """
        Runs model inference on the preprocessed crop.
        Returns a standardised output dictionary.
        Target labels mapping: Index 0 -> fake, Index 1 -> real
        """
        if self.model is None:
            raise RuntimeError(f"Model '{self.name}' is not loaded.")
            
        preprocessed = self.preprocess(crop_image)
        
        # Run prediction [batch_size, num_classes]
        predictions = self.model.predict(preprocessed, verbose=0)[0]
        
        # Alphabetical class order in Keras: Index 0 -> fake, Index 1 -> real
        score_fake = float(predictions[0])
        score_real = float(predictions[1])
        
        prediction_class = "real" if score_real >= score_fake else "fake"
        confidence = score_real if prediction_class == "real" else score_fake
        
        return {
            "model": self.name,
            "prediction": prediction_class,
            "confidence": confidence,
            "scores": {
                "real": score_real,
                "fake": score_fake
            }
        }

    def explain(self, crop_image: np.ndarray) -> np.ndarray:
        """
        Generates a Grad-CAM heatmap overlay for the given crop.
        Returns a BGR image containing the superimposed colormap,
        or None if not supported by the model architecture.
        """
        if self.model is None:
            return None

        try:
            # 1. Locate the last Conv2D layer in the model
            conv_layer_name = None
            for layer in reversed(self.model.layers):
                if isinstance(layer, tf.keras.layers.Conv2D) or "conv" in layer.name.lower():
                    conv_layer_name = layer.name
                    break
            
            if not conv_layer_name:
                logger.warning(f"Grad-CAM not supported for '{self.name}': no Conv2D layer found.")
                return None

            # 2. Get preprocessed input image batch
            preprocessed_img = self.preprocess(crop_image)

            # 3. Check model type to run appropriate forward pass
            is_sequential = "sequential" in str(type(self.model)).lower()

            if is_sequential:
                with tf.GradientTape() as tape:
                    x = preprocessed_img
                    conv_outputs = None
                    for layer in self.model.layers:
                        x = layer(x)
                        if layer.name == conv_layer_name:
                            conv_outputs = x
                    
                    class_channel = tf.argmax(x[0])
                    loss = x[:, class_channel]
                
                grads = tape.gradient(loss, conv_outputs)
                conv_outputs_val = conv_outputs[0]
            else:
                grad_model = tf.keras.models.Model(
                    inputs=self.model.inputs,
                    outputs=[self.model.get_layer(conv_layer_name).output, self.model.output]
                )
                with tf.GradientTape() as tape:
                    conv_outputs, predictions = grad_model(preprocessed_img)
                    class_channel = tf.argmax(predictions[0])
                    loss = predictions[:, class_channel]
                
                grads = tape.gradient(loss, conv_outputs)
                conv_outputs_val = conv_outputs[0]

            # 4. Global average pool the gradients along spatial dimensions
            pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

            # 5. Multiply the conv output features by gradient weights
            heatmap = conv_outputs_val @ pooled_grads[..., tf.newaxis]
            heatmap = tf.squeeze(heatmap)

            # 6. Apply ReLU and normalize between 0 and 1
            heatmap = tf.maximum(heatmap, 0.0)
            heatmap_numpy = heatmap.numpy()

            # Apply Gaussian Blur to smooth heatmap visualization
            heatmap_blurred = cv2.GaussianBlur(heatmap_numpy, (15, 15), 0)
            max_val = np.max(heatmap_blurred)
            if max_val > 0:
                heatmap_norm = heatmap_blurred / max_val
            else:
                heatmap_norm = heatmap_blurred

            # 7. Resize the heatmap back to the original crop image dimensions
            h, w = crop_image.shape[:2]
            heatmap_resized = cv2.resize(heatmap_norm, (w, h))

            # 8. Convert to uint8 and apply JET colormap
            heatmap_color = cv2.applyColorMap(np.uint8(255 * heatmap_resized), cv2.COLORMAP_JET)

            # 9. Superimpose the colormap onto the original crop (50% original, 50% heatmap)
            superimposed_img = cv2.addWeighted(crop_image, 0.5, heatmap_color, 0.5, 0)
            return superimposed_img

        except Exception as e:
            logger.error(f"Error generating Grad-CAM for '{self.name}': {e}")
            return None


class FaceModelAdapter(BaseModelAdapter):
    def __init__(self, model_dir: str):
        # Face model config shows batch_shape = [null, 224, 224, 3]
        super().__init__(model_dir, name="face", input_shape=(224, 224))


class EyeModelAdapter(BaseModelAdapter):
    def __init__(self, model_dir: str):
        # Eye model config shows batch_shape = [null, 50, 50, 3]
        super().__init__(model_dir, name="eye", input_shape=(50, 50))


class NoseModelAdapter(BaseModelAdapter):
    def __init__(self, model_dir: str):
        # Nose model config shows batch_shape = [null, 50, 50, 3]
        super().__init__(model_dir, name="nose", input_shape=(50, 50))


class LipsModelAdapter(BaseModelAdapter):
    def __init__(self, model_dir: str):
        # Lips model config shows batch_shape = [null, 50, 50, 3]
        super().__init__(model_dir, name="lips", input_shape=(50, 50))
