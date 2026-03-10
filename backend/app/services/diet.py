from typing import List, Dict

def generate_diet_plan(diet_preference: str, goal: str, target_calories: int) -> List[Dict]:
    """
    Generates a simple, structured diet plan based on preference and target calories.
    """
    # Distribution of calories roughly: Breakfast (25%), Lunch (35%), Snack (10%), Dinner (30%)
    b_cals = int(target_calories * 0.25)
    l_cals = int(target_calories * 0.35)
    s_cals = int(target_calories * 0.10)
    d_cals = target_calories - (b_cals + l_cals + s_cals)
    
    meals = []
    
    if diet_preference.lower() == "vegan":
        b_food = "Oatmeal with almond milk, chia seeds, and berries"
        l_food = "Quinoa bowl with roasted tofu, chickpeas, and mixed greens"
        s_food = "Handful of mixed nuts and an apple"
        d_food = "Lentil soup with a side of steamed broccoli and sweet potato"
    elif diet_preference.lower() == "vegetarian":
        b_food = "Greek yogurt with honey, walnuts, and sliced banana"
        l_food = "Brown rice with black beans, avocado, and grilled halloumi"
        s_food = "Cottage cheese with pineapple chunks"
        d_food = "Vegetable stir-fry with tempeh and a side of quinoa"
    elif diet_preference.lower() == "keto":
        b_food = "Scrambled eggs with spinach, avocado, and bacon"
        l_food = "Grilled chicken salad with olive oil dressing and feta cheese"
        s_food = "Macadamia nuts and string cheese"
        d_food = "Baked salmon with asparagus roasted in butter"
    else: # omnivore / default
        b_food = "Whole wheat toast with scrambled eggs and avocado"
        l_food = "Grilled chicken breast with brown rice and mixed vegetables"
        s_food = "Greek yogurt and a handful of almonds"
        d_food = "Baked salmon with quinoa and roasted asparagus"
        
    # Adjust slightly for "lose" vs "gain" or "maintain" to make it dynamic
    if goal.lower() == "gain":
        b_food += " + Protein Shake"
        l_food += " + Extra Serving of Complex Carbs"
    elif goal.lower() == "lose":
        b_food += " (Portion Controlled)"
        l_food += " (Light Dressing)"
        
    meals = [
        {"meal": "Breakfast", "food": b_food, "calories": b_cals},
        {"meal": "Lunch", "food": l_food, "calories": l_cals},
        {"meal": "Snack", "food": s_food, "calories": s_cals},
        {"meal": "Dinner", "food": d_food, "calories": d_cals},
    ]
    
    return meals
