from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime
from typing import List, Optional

# User Schemas
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):
    id: int
    is_admin: bool
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# Auth Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None


# Media Schemas
class MediaBase(BaseModel):
    filename: str
    file_url: str
    file_type: str  # "image" or "video"
    size_bytes: Optional[int] = None

class MediaOut(MediaBase):
    id: int
    user_id: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# Model Prediction Schemas
class ModelPredictionOut(BaseModel):
    id: int
    model_name: str  # "face", "eye", "nose", "lips"
    prediction: str  # "real", "fake"
    confidence: float
    score_real: float
    score_fake: float
    crop_url: Optional[str] = None
    heatmap_url: Optional[str] = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# Analysis Schemas
class AnalysisOut(BaseModel):
    id: int
    media_id: int
    user_id: int
    status: str  # queued, completed, failed, etc.
    prediction: Optional[str] = None
    confidence: Optional[float] = None
    created_at: datetime
    predictions: List[ModelPredictionOut] = []
    
    model_config = ConfigDict(from_attributes=True)


class AnalysisDetailOut(AnalysisOut):
    media: MediaOut
    
    model_config = ConfigDict(from_attributes=True)


# Admin Schemas
class AdminDashboardOut(BaseModel):
    total_media: int
    total_analyses: int
    fake_scans: int
    real_scans: int
    total_users: int

class AnalysesOverTimePoint(BaseModel):
    date: str
    count: int

class AnalysesOverTimeOut(BaseModel):
    range: str
    points: List[AnalysesOverTimePoint]

class PredictionDistributionOut(BaseModel):
    real: int
    fake: int

class AdminSystemStatusOut(BaseModel):
    cpu_percent: float
    memory_percent: float
    db_healthy: bool
    storage_used_bytes: int
    storage_free_bytes: int

class ModelStatusOut(BaseModel):
    model_name: str
    loaded: bool
    status: str

