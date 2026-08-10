import os
import logging
from config import settings

logger = logging.getLogger("CloudinaryUtils")

# Attempt to configure Cloudinary
CLOUDINARY_CONFIGURED = False
try:
    if settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY and settings.CLOUDINARY_API_SECRET:
        import cloudinary
        import cloudinary.uploader
        
        cloudinary.config(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET,
            secure=True
        )
        CLOUDINARY_CONFIGURED = True
        logger.info("Cloudinary configured and initialized successfully.")
    else:
        logger.warning("Cloudinary credentials are missing. Falling back to local storage.")
except Exception as e:
    logger.error(f"Error configuring Cloudinary: {e}. Falling back to local storage.")

def upload_file_to_cloud(file_path: str, folder: str = "fake_detection", resource_type: str = "auto") -> str:
    """
    Uploads a file to Cloudinary.
    If Cloudinary is not configured, it returns a local relative URL served by FastAPI statically.
    
    Args:
        file_path (str): The absolute local path of the file to upload.
        folder (str): Cloudinary folder name.
        resource_type (str): "image", "video", or "raw" ("auto" detects automatically).
        
    Returns:
        str: Public URL (Cloudinary link or local static path).
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
        
    filename = os.path.basename(file_path)
    
    # If Cloudinary is configured, upload to cloud
    if CLOUDINARY_CONFIGURED:
        try:
            import cloudinary.uploader
            logger.info(f"Uploading {filename} to Cloudinary ({folder})...")
            response = cloudinary.uploader.upload(
                file_path,
                folder=folder,
                resource_type=resource_type
            )
            secure_url = response.get("secure_url")
            logger.info(f"Cloudinary upload success: {secure_url}")
            return secure_url
        except Exception as e:
            logger.error(f"Cloudinary upload failed: {e}. Falling back to local path.")
            
    # Fallback: return the local static path
    # If it is inside crops folder, return static crops URL
    if "crops" in file_path:
        return f"/static/crops/{filename}"
    return f"/static/{filename}"
