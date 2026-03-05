import os
import joblib
import pandas as pd
from typing import List

# 1. Define paths to our saved models
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_DIR = os.path.join(BASE_DIR, 'ml_pipeline', 'models')

# 2. Load the models into memory globally (System Design Best Practice)
try:
    knn_model = joblib.load(os.path.join(MODEL_DIR, 'knn_model.pkl'))
    encoder = joblib.load(os.path.join(MODEL_DIR, 'encoder.pkl'))
    # Load from the stable CSV file
    exercise_db = pd.read_csv(os.path.join(MODEL_DIR, 'exercise_db.csv'))
except FileNotFoundError:
    print("Warning: ML models not found. Please run train.py first.")
    knn_model, encoder, exercise_db = None, None, None

def generate_workout_plan(location: str, goal: str) -> List[dict]:
    """
    Translates user API input into ML features, runs inference, 
    and returns a structured list of exercises.
    """
    if knn_model is None:
        return [{"exercise_name": "Model Offline", "sets": 0, "reps": "0", "target_muscle": "None"}]

    # 3. Translation Layer: Map User Input to ML Features
    # If they are at home, assume no equipment. If at the gym, assume machines/dumbbells.
    target_equipment = "body only" if location.lower() == "home" else "machine"
    target_level = "beginner" if goal.lower() == "lose" else "intermediate"
    
    workout_plan = []
    
    # We want a full-body workout, so we ask the AI for 1 exercise per major body part
    target_muscles = ['chest', 'legs', 'back', 'core']

    for muscle in target_muscles:
        # Create a dataframe for the exact feature request
        user_request = pd.DataFrame([{
            'BodyPart': muscle, 
            'Equipment': target_equipment, 
            'Level': target_level
        }])

        # 4. Encode the request to 1s and 0s
        encoded_request = encoder.transform(user_request)

        # 5. Get the single closest exercise (n_neighbors=1)
        distances, indices = knn_model.kneighbors(encoded_request, n_neighbors=1)
        
        # 6. Look up the exercise in our database
        matched_index = indices[0][0]
        exercise_row = exercise_db.iloc[matched_index]

        # Format it for our FastAPI schema
        workout_plan.append({
            "exercise_name": exercise_row['Title'].title(),
            "sets": 3 if goal == "lose" else 4,
            "reps": "12-15" if goal == "lose" else "8-10",
            "target_muscle": exercise_row['BodyPart'].title()
        })

    return workout_plan