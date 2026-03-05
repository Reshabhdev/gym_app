from fastapi import APIRouter, HTTPException
from app.schemas.user import UserInput, AppResponse
from app.core.calculator import calculate_tdee, get_target_calories
from app.services.inference import generate_workout_plan

# Initialize the router
router = APIRouter()

@router.post("/recommend", response_model=AppResponse)
async def get_fitness_recommendation(user: UserInput):
    try:
        # 1. Mathematical Baseline: Calculate calories
        tdee = calculate_tdee(
            weight=user.weight_kg, 
            height=user.height_cm, 
            age=user.age, 
            gender=user.gender, 
            activity_level=user.activity_level
        )
        target_cals = get_target_calories(tdee, user.goal)
        
        # 2. AI Inference: Generate the personalized workout plan
        workout_plan = generate_workout_plan(
            location=user.location, 
            goal=user.goal
        )
        
        # 3. Return the compiled response
        return AppResponse(
            target_calories=target_cals,
            workout_plan=workout_plan
        )
        
    except Exception as e:
        # Industry standard: Always catch errors and return a clean HTTP response
        raise HTTPException(status_code=500, detail=f"An error occurred generating the plan: {str(e)}")