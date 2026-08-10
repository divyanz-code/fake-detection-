import cv2
import numpy as np
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("FacialFeatureExtractor")

class FacialFeatureExtractor:
    """
    FacialFeatureExtractor handles the image preprocessing pipeline for Deepfake Detection.
    It performs:
    1. Face Detection and Landmark Detection (via MediaPipe Face Mesh)
    2. Face Alignment (rotating face so eyes are horizontal)
    3. Face Cropping
    4. Contrast Enhancement (CLAHE)
    5. Noise Removal (Bilateral Filtering)
    6. Region Extraction (Cropping Eyes, Nose, Lips, and Whole Face)
    """
    def __init__(self):
        self.mp_face_mesh = None
        self.face_mesh = None
        self._init_mediapipe()

        # Landmark indices for MediaPipe Face Mesh
        # Left Eye landmarks (relative to person's left)
        self.LEFT_EYE_INDICES = [
            33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246
        ]
        # Right Eye landmarks (relative to person's right)
        self.RIGHT_EYE_INDICES = [
            263, 249, 390, 373, 374, 380, 381, 382, 362, 398, 384, 385, 386, 387, 388, 466
        ]
        # Nose landmarks
        self.NOSE_INDICES = [
            1, 2, 3, 4, 5, 6, 48, 64, 98, 115, 122, 129, 131, 195, 197, 220, 275, 278, 294, 327, 344, 351, 358, 360
        ]
        # Lips/Mouth landmarks
        self.LIPS_INDICES = [
            61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 308, 324, 318, 402, 317, 
            14, 87, 178, 88, 95, 78, 191, 80, 81, 82, 13, 312, 311, 310, 415
        ]

    def _init_mediapipe(self):
        """Initializes the MediaPipe library components."""
        try:
            import mediapipe as mp
            self.mp_face_mesh = mp.solutions.face_mesh
            # static_image_mode=True is optimized for single image processing
            self.face_mesh = self.mp_face_mesh.FaceMesh(
                static_image_mode=True,
                max_num_faces=1,
                refine_landmarks=True,
                min_detection_confidence=0.5
            )
            logger.info("MediaPipe Face Mesh successfully initialized.")
        except ImportError:
            logger.error("MediaPipe is not installed. Please add it to requirements.txt.")

    def _get_landmarks(self, image):
        """Runs Face Mesh and returns the landmarks for the first detected face."""
        if self.face_mesh is None:
            logger.warning("MediaPipe Face Mesh is not initialized.")
            return None

        # MediaPipe expects RGB images
        rgb_img = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = self.face_mesh.process(rgb_img)

        if results.multi_face_landmarks:
            return results.multi_face_landmarks[0].landmark
        return None

    def align_face(self, image, landmarks):
        """
        Aligns the face horizontally based on the angle of the eyes.
        """
        h, w = image.shape[:2]

        # Calculate centers of left and right eyes
        left_eye_pts = []
        right_eye_pts = []

        for idx in self.LEFT_EYE_INDICES:
            pt = landmarks[idx]
            left_eye_pts.append((pt.x * w, pt.y * h))

        for idx in self.RIGHT_EYE_INDICES:
            pt = landmarks[idx]
            right_eye_pts.append((pt.x * w, pt.y * h))

        left_center = np.mean(left_eye_pts, axis=0)
        right_center = np.mean(right_eye_pts, axis=0)

        # Calculate angle of rotation
        dy = right_center[1] - left_center[1]
        dx = right_center[0] - left_center[0]
        angle = np.degrees(np.arctan2(dy, dx))

        # We want the eyes to be horizontal, so rotate around midpoint
        eye_midpoint = (
            int((left_center[0] + right_center[0]) / 2),
            int((left_center[1] + right_center[1]) / 2)
        )

        # Get rotation matrix and warp the image
        M = cv2.getRotationMatrix2D(eye_midpoint, angle, scale=1.0)
        aligned_image = cv2.warpAffine(image, M, (w, h), flags=cv2.INTER_CUBIC)

        return aligned_image

    def enhance_contrast(self, image):
        """Applies CLAHE on the L channel of LAB color space to enhance facial features contrast."""
        lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        cl = clahe.apply(l)
        enhanced_lab = cv2.merge((cl, a, b))
        return cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2BGR)

    def denoise_image(self, image):
        """Applies Bilateral Filter to remove noise while preserving facial edges."""
        # bilateralFilter preserves sharp edges while smoothing flat regions
        return cv2.bilateralFilter(image, d=9, sigmaColor=75, sigmaSpace=75)

    def crop_bbox(self, image, landmarks, indices, padding_ratio=0.1, square=False):
        """
        Crops a region from the image containing the landmarks specified by the indices.
        Optional: enforces a square crop if square=True.
        """
        h, w = image.shape[:2]
        pts = []
        for idx in indices:
            if idx < len(landmarks):
                pt = landmarks[idx]
                pts.append((int(pt.x * w), int(pt.y * h)))

        if not pts:
            return None, None

        pts = np.array(pts)
        bx, by, bw, bh = cv2.boundingRect(pts)

        # Add padding
        pad_w = int(bw * padding_ratio)
        pad_h = int(bh * padding_ratio)

        x1 = max(0, bx - pad_w)
        y1 = max(0, by - pad_h)
        x2 = min(w, bx + bw + pad_w)
        y2 = min(h, by + bh + pad_h)

        crop_w = x2 - x1
        crop_h = y2 - y1

        if square:
            # Enforce square aspect ratio by expanding the smaller dimension
            side = max(crop_w, crop_h)
            cx, cy = x1 + crop_w // 2, y1 + crop_h // 2
            
            x1 = max(0, cx - side // 2)
            y1 = max(0, cy - side // 2)
            x2 = min(w, x1 + side)
            y2 = min(h, y1 + side)
            
            # Recalculate dimensions in case boundaries clipped it
            crop_w = x2 - x1
            crop_h = y2 - y1

        cropped = image[y1:y2, x1:x2]
        bbox = (x1, y1, crop_w, crop_h)
        return cropped, bbox

    def preprocess_pipeline(self, image_path):
        """
        Processes a single image file through the full face alignment, cropping,
        contrast enhancement, noise removal, and sub-region extraction pipeline.
        
        Returns:
            dict: A dictionary containing preprocessed crops of:
                  - 'face': whole face image (224x224)
                  - 'eye': eye region image (50x50)
                  - 'nose': nose region image (50x50)
                  - 'lips': lips region image (50x50)
                  And bounding boxes (in aligned coordinate system) for UI display.
        """
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image not found at {image_path}")

        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"Could not load image at {image_path}")

        # 1. Detect Landmarks on original image
        landmarks = self._get_landmarks(image)
        if landmarks is None:
            logger.warning(f"No face detected in {image_path}")
            return None

        # 2. Face Alignment
        aligned_image = self.align_face(image, landmarks)

        # 3. Detect Landmarks again on the aligned image to get precise crops
        aligned_landmarks = self._get_landmarks(aligned_image)
        if aligned_landmarks is None:
            # Fallback to original landmarks if detection fails on warped image
            logger.warning("Redetection on aligned image failed. Using warped original landmarks.")
            aligned_landmarks = landmarks

        # 4. Crop Whole Face (force square crop for ViT model)
        # Face silhouette uses all 468 landmarks
        face_indices = list(range(468))
        raw_face_crop, face_bbox = self.crop_bbox(aligned_image, aligned_landmarks, face_indices, padding_ratio=0.15, square=True)
        if raw_face_crop is None:
            logger.warning("Failed to crop face region.")
            return None

        # 5. Contrast Enhancement & Denoising on the cropped face
        enhanced_face = self.enhance_contrast(raw_face_crop)
        processed_face = self.denoise_image(enhanced_face)

        # 6. Extract sub-regions from the aligned image, and process them
        # (Alternatively, we can crop from the enhanced face crop, but cropping from
        # aligned_image and then applying enhancement/denoising individually is cleaner
        # because sub-region coordinate mapping is simpler).
        
        # Eyes region (Left + Right combined)
        eye_indices = self.LEFT_EYE_INDICES + self.RIGHT_EYE_INDICES
        raw_eye_crop, eye_bbox = self.crop_bbox(aligned_image, aligned_landmarks, eye_indices, padding_ratio=0.2, square=True)
        
        # Nose region
        raw_nose_crop, nose_bbox = self.crop_bbox(aligned_image, aligned_landmarks, self.NOSE_INDICES, padding_ratio=0.2, square=True)
        
        # Lips region
        raw_lips_crop, lips_bbox = self.crop_bbox(aligned_image, aligned_landmarks, self.LIPS_INDICES, padding_ratio=0.2, square=True)

        # Process and enhance sub-regions if they were cropped successfully
        processed_eye = self.denoise_image(self.enhance_contrast(raw_eye_crop)) if raw_eye_crop is not None else None
        processed_nose = self.denoise_image(self.enhance_contrast(raw_nose_crop)) if raw_nose_crop is not None else None
        processed_lips = self.denoise_image(self.enhance_contrast(raw_lips_crop)) if raw_lips_crop is not None else None

        # Resize crops to match model input requirements:
        # Face Model: 224x224
        # Eye, Nose, Lips Models: 50x50
        final_face = cv2.resize(processed_face, (224, 224), interpolation=cv2.INTER_AREA)
        
        final_eye = cv2.resize(processed_eye, (50, 50), interpolation=cv2.INTER_AREA) if processed_eye is not None else None
        final_nose = cv2.resize(processed_nose, (50, 50), interpolation=cv2.INTER_AREA) if processed_nose is not None else None
        final_lips = cv2.resize(processed_lips, (50, 50), interpolation=cv2.INTER_AREA) if processed_lips is not None else None

        return {
            'crops': {
                'face': final_face,
                'eye': final_eye,
                'nose': final_nose,
                'lips': final_lips
            },
            'bboxes': {
                'face': face_bbox,
                'eye': eye_bbox,
                'nose': nose_bbox,
                'lips': lips_bbox
            },
            'aligned_image': aligned_image
        }
