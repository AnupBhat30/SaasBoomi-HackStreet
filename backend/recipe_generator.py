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
    "recipeName": "Vegetable Casserole Recipe",
    "tags": [
        "Vegetable",
        "Casserole",
        "Vegetable Casserole",
        "VegetableCasserole",
    ]
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


# Small verification schema used to ask the LLM whether the found recipes match the search intent
class Verification(BaseModel):
    match: bool
    use_context: bool
    reason: str


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
        }
    }
else:
    prompt_payload = {"input_recipe": input_recipe}

# Final generation prompt asks the model to produce the Recipe schema JSON, using context when available
prompt = (
    "Generate a recipe using the following input. If a 'context' field is present, use it to inform ingredients, instructions and cultural details. Return JSON that matches the Recipe Pydantic schema.\n"
    + json.dumps(prompt_payload, ensure_ascii=False)
)

response = client.models.generate_content(
    model="gemini-2.5-flash-lite",
    config=types.GenerateContentConfig(
        system_instruction="Generate a recipe in the given schema",
        response_schema=Recipe
    ),
    contents=prompt
)


def write_json(obj, path="generatedRecipe.json"):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, indent=2, ensure_ascii=False)


if hasattr(response, "parsed") and response.parsed is not None:
    # Response parsed directly into the Pydantic model
    recipe_obj: Recipe = response.parsed
    json_recipe = recipe_obj.dict()
    write_json(json_recipe)
    print("✅ Recipe generated and saved to generatedRecipe.json")
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
            write_json(parsed)
            print("✅ Parsed JSON from raw response and saved to generatedRecipe.json")
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
