import cv2
import os
import sys

# Add the parent directory to the path so we can import the extraction module
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from extraction import FacialFeatureExtractor

def test_extraction(image_path):
    print(f"Testing FacialFeatureExtractor on: {image_path}")
    
    # Initialize extractor
    try:
        extractor = FacialFeatureExtractor()
    except Exception as e:
        print(f"Error initializing extractor: {e}")
        return

    # Run the preprocessing pipeline
    try:
        results = extractor.preprocess_pipeline(image_path)
    except Exception as e:
        print(f"Error running preprocessing pipeline: {e}")
        return

    if results is None:
        print("No face detected or extraction failed.")
        return

    # Create output directory
    output_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "test_output")
    os.makedirs(output_dir, exist_ok=True)
    print(f"Saving extracted crops to: {output_dir}")

    # Save original aligned image
    aligned_path = os.path.join(output_dir, "face_aligned.png")
    cv2.imwrite(aligned_path, results['aligned_image'])
    print(f"Saved aligned face image to {aligned_path}")

    # Save individual crops
    for name, crop in results['crops'].items():
        if crop is not None:
            crop_path = os.path.join(output_dir, f"crop_{name}.png")
            cv2.imwrite(crop_path, crop)
            print(f"Saved {name} crop (shape: {crop.shape}) to {crop_path}")
        else:
            print(f"Crop '{name}' was not extracted.")

    # Print bounding boxes
    print("\nBounding boxes (x, y, w, h):")
    for name, bbox in results['bboxes'].items():
        print(f"  {name}: {bbox}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_extractor.py <path_to_sample_image>")
        
        # Look for any sample image in the project to run automatically
        print("\nSearching for a sample image in the workspace...")
        sample_extensions = ('.jpg', '.jpeg', '.png')
        found_sample = None
        for root, dirs, files in os.walk(os.path.dirname(os.path.abspath(__file__))):
            # Ignore venv and node_modules
            if 'venv' in root or 'node_modules' in root or '.git' in root:
                continue
            for file in files:
                if file.lower().endswith(sample_extensions):
                    found_sample = os.path.join(root, file)
                    break
            if found_sample:
                break
        
        if found_sample:
            print(f"Found sample image: {found_sample}")
            test_extraction(found_sample)
        else:
            print("No sample image found in the workspace. Please run with a path to a sample image.")
    else:
        test_extraction(sys.argv[1])
