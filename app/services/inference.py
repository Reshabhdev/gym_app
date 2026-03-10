import os
import json
from typing import List

# 1. Define paths to our saved models
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_DIR = os.path.join(BASE_DIR, 'ml_pipeline', 'models')

# 2. Load the models into memory globally (System Design Best Practice)
try:
    cache_path = os.path.join(MODEL_DIR, 'workout_plans_cache.json')
    with open(cache_path, 'r') as f:
        workout_plans_cache = json.load(f)
except FileNotFoundError:
    print("Warning: ML models not found. Please run export_model_to_json.py first.")
    workout_plans_cache = None

def generate_workout_plan(location: str, goal: str) -> List[dict]:
    """
    Translates user API input into ML features, runs inference, 
    and returns a structured list of exercises.
    """
    if workout_plans_cache is None:
        return [{"exercise_name": "Model Offline", "sets": 0, "reps": "0", "target_muscle": "None"}]

    loc_key = "home" if location.lower() == "home" else "gym"
    goal_key = "lose" if goal.lower() == "lose" else "build"
    cache_key = f"{loc_key}_{goal_key}"
    
    plan = workout_plans_cache.get(cache_key)
    
    if plan:
        return plan
    else:
        return [{"exercise_name": "Plan Not Found", "sets": 0, "reps": "0", "target_muscle": "None"}]