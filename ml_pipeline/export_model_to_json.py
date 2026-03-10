import os
import sys
import json

# Add the project root to sys.path so we can import app modules
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

from app.services.inference import generate_workout_plan

def main():
    print("Generating workout plans cache...")
    
    # We only have a few combinations because of the translation layer in inference.py
    # target_equipment: "body only" if location.lower() == "home" else "machine"
    # target_level: "beginner" if goal.lower() == "lose" else "intermediate"
    
    locations = ["home", "gym"]
    goals = ["lose", "build"]
    
    cache = {}
    
    for loc in locations:
        for goal in goals:
            key = f"{loc}_{goal}"
            try:
                plan = generate_workout_plan(loc, goal)
                cache[key] = plan
                print(f"✅ Generated plan for: {key}")
            except Exception as e:
                print(f"❌ Failed for {key}: {e}")
                
    output_path = os.path.join(BASE_DIR, 'ml_pipeline', 'models', 'workout_plans_cache.json')
    with open(output_path, 'w') as f:
        json.dump(cache, f, indent=4)
        
    print(f"\nSuccessfully saved cache to {output_path}")

if __name__ == "__main__":
    main()
