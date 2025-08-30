import os
import json
import re
from dotenv import load_dotenv
from typing import List
from pydantic import BaseModel
from google import genai
from google.genai import types

# Load env vars
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

# Input object: recipe name and tags (tags are derived from the recipe name, avoid basic commodities)
input_recipe = {
    "recipeName": "Chicken Biryani",
    "tags": [
        "Chicken",
        "Biryani",
        "Rice",
        "Meat",
        "Indian",
        "Non-Vegetarian",
        "Aromatic"
    ]
}


userInfo = {
    "name": "Mr. Sharma",
    "age": 68,
    "BMI": 26,
    "gender": "Male",
    "health_conditions": ["hypertension", "arthritis", "social_isolation"],
    "allergies": [],
    "health_goals": ["reduce loneliness", "maintain mobility", "manage blood pressure", "improve digital literacy"],
    "medication_details": [],
    "budget_for_food": 1000,  # Weekly budget for food in ₹ (reasonable for a Tier-2 retiree)
    "occupation_type": "retired",
    "work_schedule": "none",
    "access_to_kitchen": "shared_community_kitchen",  # shared or limited personal kitchen
    "stress_level": "moderate",
    "meal_source": "home_cooked",  # primarily at-home / community meals
    "preferred_interface": {"font_size": "large", "simplicity": "very_simple", "guided_tours": True}
}

environmentContext = {
    "location": "Jaipur",
    "availability": [
        "rice",
        "dal",
        "chapati_flour",
        "basic_spices",
        "curd",
        "banana",
        "roasted_chana",
        "cooking_oil"
    ],
    "season": "Autumn",
    "cultural_event": "local_fairs_and_meets"
}

# Ingredient mapping for consistent matching
INGREDIENT_MAPPINGS = {
    # Available ingredients and their synonyms/variations
    "rice": ["rice", "basmati rice", "white rice", "cooked rice"],
    "dal": ["dal", "lentils", "toor dal", "moong dal", "masoor dal", "chana dal"],
    "chapati_flour": ["chapati flour", "wheat flour", "atta", "flour", "whole wheat flour"],
    "basic_spices": ["basic spices", "spices", "turmeric", "cumin", "coriander", "garam masala", 
                    "red chili powder", "cumin powder", "coriander powder", "spice powder", "masala"],
    "curd": ["curd", "yogurt", "dahi", "greek yogurt", "hung curd"],
    "banana": ["banana", "bananas", "ripe banana"],
    "roasted_chana": ["roasted chana", "chana", "chickpeas", "roasted chickpeas", "bhuna chana"],
    "cooking_oil": ["cooking oil", "oil", "vegetable oil", "sunflower oil", "mustard oil", "ghee"],
    # Categories that can include multiple items
    "seasonal_vegetables": ["onion", "onions", "tomato", "tomatoes", "bell pepper", "capsicum", 
                           "cauliflower", "cabbage", "carrots", "beans", "spinach", "seasonal vegetables", "vegetables"],
    "basic_aromatics": ["ginger", "garlic", "green chili", "curry leaves"],
    "common_condiments": ["lemon juice", "lime juice", "salt", "sugar"],
}

# If the API key is not set, write the prompt locally and exit so the script is safe to run without credentials.
if not api_key:
    prompt_obj = {"input_recipe": input_recipe}
    with open("prompt.json", "w", encoding="utf-8") as f:
        json.dump(prompt_obj, f, indent=2, ensure_ascii=False)
    print("No GEMINI_API_KEY found in environment. Wrote prompt object to prompt.json and exiting.")
    import sys
    sys.exit(0)

client = genai.Client(api_key=api_key)


# ---------- Pydantic Schemas (all fields required) ----------
class Ingredient(BaseModel):
    name: str
    quantity: str
    notes: str


class NutritionalInfo(BaseModel):
    calories: float
    protein_g: float
    carbohydrates_g: float
    fat_g: float
    fiber_g: float
    glycemic_index: float


class InstructionStep(BaseModel):
    step_number: int
    instruction: str


class Recipe(BaseModel):
    recipeName: str
    cuisine: str
    servings: int
    ingredients: List[Ingredient]
    instructions: List[InstructionStep]
    nutritionalInfo: NutritionalInfo
    dietary_tags: List[str]
    prep_time_min: int
    cook_time_min: int
    meal_type: str
    cultural_context: str
    source: str
    ingredients_to_buy: List[str]


# Small verification schema used to ask the LLM whether the found recipes match the search intent
class Verification(BaseModel):
    match: bool
    use_context: bool
    reason: str


# Schema for ingredient matching analysis
class IngredientMatch(BaseModel):
    recipe_ingredient: str
    available_match: str  # empty string if no match found
    is_available: bool
    reason: str


class IngredientAnalysis(BaseModel):
    matches: List[IngredientMatch]
    ingredients_to_buy: List[str]


# ---------- Generate Recipe ----------
# Build a prompt that includes the input object so the model can use the provided recipe name and tags.
def load_recipes(path="recipes1.json"):
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []


def find_matches(tags, recipes, top_k=3):
    tags_lc = [t.lower() for t in tags]
    candidates = []
    for r in recipes:
        score = 0
        text_fields = []
        for key in ("TranslatedRecipeName", "Cleaned-Ingredients", "TranslatedIngredients"):
            val = r.get(key, "") or ""
            text_fields.append(val)
            val_lc = val.lower()
            for t in tags_lc:
                if t in val_lc:
                    score += 1
        if score > 0:
            candidates.append({"score": score, "recipe": r, "snippet": " ".join(text_fields)[:800]})
    candidates.sort(key=lambda x: x["score"], reverse=True)
    return candidates[:top_k]


def check_ingredient_availability(ingredient_name: str, available_items: List[str], mappings: dict) -> tuple[bool, str]:
    """
    Consistently check if an ingredient is available using predefined mappings.
    Returns (is_available, matched_category).
    """
    ingredient_lower = ingredient_name.lower().strip()
    
    # Direct match in available items
    available_lower = [item.lower() for item in available_items]
    if ingredient_lower in available_lower:
        return True, ingredient_lower
    
    # Check if ingredient matches available items through mappings
    for available_item in available_items:
        available_item_lower = available_item.lower()
        if available_item_lower in mappings:
            synonyms = mappings[available_item_lower]
            for synonym in synonyms:
                if synonym.lower() == ingredient_lower or ingredient_lower in synonym.lower() or synonym.lower() in ingredient_lower:
                    return True, available_item_lower
    
    # Special cases for common variations
    if any(word in ingredient_lower for word in ['powder', 'paste']) and 'basic_spices' in available_lower:
        return True, 'basic_spices'
    
    # Check if ingredient is a basic essential (always available)
    basic_essentials = ['water', 'salt']
    if ingredient_lower in basic_essentials:
        return True, 'basic_essential'
    
    return False, ""


def get_consistent_ingredients_to_buy(recipe_ingredients: List[dict], available_items: List[str]) -> List[str]:
    """
    Consistently determine which ingredients need to be bought using deterministic logic.
    """
    ingredients_to_buy = []
    
    print(f"  📋 Analyzing {len(recipe_ingredients)} recipe ingredients against {len(available_items)} available items")
    
    for ingredient in recipe_ingredients:
        # Extract ingredient name from different possible formats
        ingredient_name = ""
        if isinstance(ingredient, dict):
            ingredient_name = (ingredient.get("name") or 
                             ingredient.get("ingredient") or 
                             ingredient.get("ingredientName") or 
                             ingredient.get("ingredient_name") or
                             ingredient.get("item") or "").strip()
        elif isinstance(ingredient, str):
            ingredient_name = ingredient.strip()
        
        if not ingredient_name:
            continue
            
        # Clean ingredient name (remove quantities, parentheses, etc.)
        original_name = ingredient_name
        ingredient_name = re.sub(r'\([^)]*\)', '', ingredient_name)  # Remove parentheses
        ingredient_name = re.sub(r'\d+.*?(tsp|tbsp|cup|g|kg|ml|l|inch|clove|piece)s?\b', '', ingredient_name, flags=re.IGNORECASE)
        ingredient_name = ingredient_name.strip()
        
        is_available, matched_category = check_ingredient_availability(ingredient_name, available_items, INGREDIENT_MAPPINGS)
        
        if not is_available:
            # Standardize the name for consistency
            standardized_name = ingredient_name.title()
            if standardized_name not in ingredients_to_buy:
                ingredients_to_buy.append(standardized_name)
                
        status_icon = "✅ Available" if is_available else "❌ Need to buy"
        match_info = f" (matches: {matched_category})" if matched_category else ""
        print(f"    {status_icon}: '{original_name}' -> '{ingredient_name}'{match_info}")
    
    # Sort for consistency
    ingredients_to_buy.sort()
    print(f"  🛒 Final shopping list: {ingredients_to_buy}")
    return ingredients_to_buy


# Load recipes and find candidates
recipes = load_recipes()
candidates = find_matches(input_recipe.get("tags", []), recipes)

# Prepare a verification prompt for the LLM to decide if the candidates match intent
summaries = []
for c in candidates:
    r = c["recipe"]
    summaries.append({
        "name": r.get("TranslatedRecipeName"),
        "cleaned_ingredients": r.get("Cleaned-Ingredients"),
        "instructions": (r.get("TranslatedInstructions") or "")[:1000]
    })

verification_prompt = {
    "input_recipe": input_recipe,
    "candidates": summaries
}

# Ask the model to verify whether the candidates satisfy the search intent (return JSON matching Verification schema)
verif_resp = client.models.generate_content(
    model="gemini-2.5-flash-lite",
    config=types.GenerateContentConfig(
        system_instruction="You will be given an input_recipe (with tags) and a list of candidate recipes. Decide whether the candidates match the search intent. Return JSON exactly matching the schema: {match: bool, use_context: bool, reason: str}.",
        response_schema=Verification
    ),
    contents=json.dumps(verification_prompt, ensure_ascii=False)
)

use_context = False
verified = None
if hasattr(verif_resp, "parsed") and verif_resp.parsed is not None:
    verified: Verification = verif_resp.parsed
    use_context = bool(verified.match and verified.use_context)
else:
    # If verification failed or couldn't parse, fall back to using context only if we have candidates
    use_context = len(candidates) > 0

if use_context:
    # Print a console.log style message as requested
    print('console.log: using context from recipes1.json')
    # Attach top candidate as context
    context = candidates[0]["recipe"]
    prompt_payload = {
        "input_recipe": input_recipe,
        "context": {
            "name": context.get("TranslatedRecipeName"),
            "ingredients": context.get("Cleaned-Ingredients"),
            "instructions": context.get("TranslatedInstructions"),
            "cuisine": context.get("Cuisine")
        },
        "userInfo": userInfo,
        "environmentContext": environmentContext
    }
else:
    prompt_payload = {
        "input_recipe": input_recipe,
        "userInfo": userInfo,
        "environmentContext": environmentContext
    }

# Final generation prompt asks the model to produce the Recipe schema JSON, using context when available
# Modified prompt to center recipe around available ingredients with deterministic matching
available_ingredients_str = ", ".join(environmentContext["availability"])
ingredient_mappings_str = json.dumps(INGREDIENT_MAPPINGS, indent=2)

prompt = f"""
Generate a recipe for {input_recipe['recipeName']} using ONLY the available ingredients listed below:

STRICTLY AVAILABLE INGREDIENTS: {available_ingredients_str}

INGREDIENT SUBSTITUTION RULES:
- 'basic_spices' can substitute for: turmeric, cumin, coriander, garam masala, red chili powder, spice powders
- 'curd' can substitute for: yogurt, greek yogurt, hung curd
- 'cooking_oil' can substitute for: any cooking oil, ghee
- 'dal' can substitute for: any lentils (toor, moong, masoor, chana dal)
- 'chapati_flour' can substitute for: wheat flour, atta
- 'roasted_chana' can substitute for: chickpeas, roasted chickpeas

STRICT CONSTRAINTS:
- Use ONLY ingredients from the available list or their valid substitutes
- Do NOT use seasonal_vegetables, basic_aromatics, or common_condiments unless they are in the available list
- If you absolutely need onions, tomatoes, ginger, garlic, or other fresh items, add them to 'ingredients_to_buy'
- Prefer simple recipes that work with the limited available ingredients

USER CONTEXT: {json.dumps(userInfo, ensure_ascii=False)}
ENVIRONMENT: {json.dumps(environmentContext, ensure_ascii=False)}
{"RECIPE CONTEXT: " + json.dumps(prompt_payload.get("context", {}), ensure_ascii=False) if use_context else ""}

Return JSON matching the Recipe schema. Keep ingredients_to_buy minimal and realistic.
"""

response = client.models.generate_content(
    model="gemini-2.5-flash-lite",
    config=types.GenerateContentConfig(
        system_instruction="Generate a recipe in the given schema, centered around the user's available ingredients. Prioritize using available items, considering synonyms and categories. Be deterministic and consistent in ingredient selection. Populate ingredients_to_buy only with absolutely essential items not available.",
        response_schema=Recipe,
        temperature=0.1  # Lower temperature for more consistency
    ),
    contents=prompt
)


def write_json(obj, path="generatedRecipe.json"):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, indent=2, ensure_ascii=False)


if hasattr(response, "parsed") and response.parsed is not None:
    # Response parsed directly into the Pydantic model
    recipe_obj: Recipe = response.parsed
    
    # Use consistent ingredient matching instead of fallback logic
    print("🔍 Analyzing ingredient availability with consistent matching:")
    consistent_to_buy = get_consistent_ingredients_to_buy(
        [{"name": ing.name} for ing in recipe_obj.ingredients], 
        environmentContext["availability"]
    )
    
    # Override the AI's ingredients_to_buy with our consistent analysis
    recipe_obj.ingredients_to_buy = consistent_to_buy
    
    # Convert to dict and save
    json_recipe = recipe_obj.dict()
    write_json(json_recipe)
    
    print(f"\n✅ Recipe generated and saved to generatedRecipe.json")
    print(f"📝 Ingredients needed: {len(recipe_obj.ingredients)} total")
    print(f"🛒 Items to buy: {len(recipe_obj.ingredients_to_buy)} ({', '.join(recipe_obj.ingredients_to_buy) if recipe_obj.ingredients_to_buy else 'None - all ingredients available!'})")
    
else:
    # Fallback: try to extract JSON from response.text (strip markdown fences)
    raw = getattr(response, "text", None) or str(response)

    # Remove triple-backtick blocks and extract first JSON object
    m = re.search(r'```(?:json)?\s*(.*?)\s*```', raw, re.DOTALL | re.IGNORECASE)
    if m:
        raw = m.group(1)

    start = raw.find('{')
    end = raw.rfind('}')
    if start != -1 and end != -1 and end > start:
        candidate = raw[start:end+1]
        try:
            parsed = json.loads(candidate)
            
            # Use consistent ingredient matching for fallback case too
            print("🔍 Analyzing ingredient availability with consistent matching (fallback):")
            recipe_ingredients = []
            for ing in parsed.get("ingredients", []):
                if isinstance(ing, dict):
                    name = (ing.get("name") or ing.get("ingredient") or 
                           ing.get("ingredientName") or ing.get("ingredient_name") or 
                           ing.get("item") or "").strip()
                    if name:
                        recipe_ingredients.append({"name": name})
            
            consistent_to_buy = get_consistent_ingredients_to_buy(recipe_ingredients, environmentContext["availability"])
            parsed["ingredients_to_buy"] = consistent_to_buy
            
            write_json(parsed)
            print("✅ Parsed JSON from raw response and saved to generatedRecipe.json")
            print(f"🛒 Items to buy: {len(consistent_to_buy)} ({', '.join(consistent_to_buy) if consistent_to_buy else 'None - all ingredients available!'})")
                
        except Exception as e:
            debug_path = "generatedRecipe.raw.txt"
            with open(debug_path, "w", encoding="utf-8") as f:
                f.write(raw)
            print(f"Could not parse JSON from raw response: {e}; wrote raw to {debug_path}")
    else:
        debug_path = "generatedRecipe.raw.txt"
        with open(debug_path, "w", encoding="utf-8") as f:
            f.write(raw)
        print(f"No JSON object found in response; wrote raw response to {debug_path}")