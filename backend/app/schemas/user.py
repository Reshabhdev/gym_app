from pydantic import BaseModel, Field
from typing import List, Literal, Optional

class UserInput(BaseModel):
    age: int = Field(..., gt=10, lt=100)
    gender: Literal["male", "female"]
    weight_kg: float = Field(..., gt=30)
    height_cm: float = Field(..., gt=100)
    activity_level: Literal["sedentary", "light", "moderate", "active", "very_active"]
    goal: Literal["lose", "maintain", "gain"]
    diet_preference: str # e.g., "vegan", "keto", "omnivore"
    location: str # e.g., "gym", "home", "park"

class MealRecommendation(BaseModel):
    meal: str
    food: str
    calories: int

class ExerciseRecommendation(BaseModel):
    exercise_name: str
    sets: int
    reps: str
    target_muscle: str
    instructions: Optional[str] = None

class AppResponse(BaseModel):
    target_calories: int
    workout_plan: List[ExerciseRecommendation]
    diet_plan: List[MealRecommendation]