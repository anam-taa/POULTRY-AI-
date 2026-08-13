from typing import Optional
from sqlmodel import Field, SQLModel
from datetime import datetime, timezone

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    hashed_password: str
    role: str = Field(default="farmer") # farmer, dealer, vet, admin
    full_name: Optional[str] = None
    email: Optional[str] = None

class AnalysisLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Image Info
    filename: str
    image_url: str
    
    # Results
    bird_count: int
    density_score: int
    density_label: str
    
    # Insights (Stored as JSON string representation)
    insights_json: str = "[]"
    
    # Full detections list for Bootstrap Training (added in Phase 3)
    detections_json: str = "[]"
