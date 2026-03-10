def calculate_tdee(weight: float, height: float, age: int, gender: str, activity_level: str) -> float:
    # 1. Calculate BMR
    if gender == "male":
        bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5
    else:
        bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161
        
    # 2. Activity Multipliers
    multipliers = {
        "sedentary": 1.2,
        "light": 1.375,
        "moderate": 1.55,
        "active": 1.725,
        "very_active": 1.9
    }
    
    tdee = bmr * multipliers.get(activity_level, 1.2)
    return tdee

def get_target_calories(tdee: float, goal: str) -> int:
    if goal == "lose":
        return int(tdee - 500) # 500 calorie deficit
    elif goal == "gain":
        return int(tdee + 500) # 500 calorie surplus
    return int(tdee)