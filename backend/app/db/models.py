from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from app.db.database import Base

class WorkoutRequest(Base):
    __tablename__ = "workout_requests"

    # Primary Key
    id = Column(Integer, primary_key=True, index=True)

    # User Inputs
    age = Column(Integer, nullable=False)
    gender = Column(String(10), nullable=False)
    weight_kg = Column(Float, nullable=False)
    height_cm = Column(Float, nullable=False)
    activity_level = Column(String(20), nullable=False)
    goal = Column(String(20), nullable=False)
    diet_preference = Column(String(20), nullable=False)
    location = Column(String(20), nullable=False)

    # Outcomes
    target_calories = Column(Integer, nullable=False)

    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
