from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    media_uploads = relationship("Media", back_populates="user", cascade="all, delete-orphan")
    analyses = relationship("Analysis", back_populates="user", cascade="all, delete-orphan")


class Media(Base):
    __tablename__ = "media"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    file_url = Column(String, nullable=False)
    file_type = Column(String, nullable=False)  # "image" or "video"
    size_bytes = Column(Integer, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="media_uploads")
    analyses = relationship("Analysis", back_populates="media", cascade="all, delete-orphan")


class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)
    media_id = Column(Integer, ForeignKey("media.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String, default="queued")  # queued, uploading, preprocessing, face_detection, model_inference, voting, completed, failed
    prediction = Column(String, nullable=True)  # "real", "fake", "uncertain"
    confidence = Column(Float, nullable=True)  # Final aggregated probability/score
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="analyses")
    media = relationship("Media", back_populates="analyses")
    predictions = relationship("ModelPrediction", back_populates="analysis", cascade="all, delete-orphan")


class ModelPrediction(Base):
    __tablename__ = "model_predictions"

    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, ForeignKey("analyses.id"), nullable=False)
    model_name = Column(String, nullable=False)  # "face", "eye", "nose", "lips"
    prediction = Column(String, nullable=False)  # "real", "fake"
    confidence = Column(Float, nullable=False)
    score_real = Column(Float, nullable=False)
    score_fake = Column(Float, nullable=False)
    crop_url = Column(String, nullable=True)
    heatmap_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    analysis = relationship("Analysis", back_populates="predictions")
