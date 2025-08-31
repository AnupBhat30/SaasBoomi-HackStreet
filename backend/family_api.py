from fastapi import APIRouter, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, List
import uvicorn
import logging
import json
import os
from family import FamilyNutritionTracker

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize the tracker
tracker = FamilyNutritionTracker()

# Request models
class MealIdeaRequest(BaseModel):
    meal_idea: str

class MealLogRequest(BaseModel):
    date: str
    meal_type: str
    foods: list[str]
    time_logged: str
    satisfaction_rating: Optional[int] = None
    notes: Optional[str] = ""

class DeviationRequest(BaseModel):
    member_name: str
    deviation_description: str

class RecipeRecommendationRequest(BaseModel):
    query: str
    userId: Optional[str] = "default"
    preferences: Optional[Dict] = {}

@router.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "Family Nutrition API is running"}

@router.get("/family")
async def get_family_profiles():
    """Get family member profiles"""
    try:
        return {
            "family_profiles": tracker.family_profiles,
            "total_members": len(tracker.family_profiles)
        }
    except Exception as e:
        logger.error(f"Error fetching family profiles: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch family profiles")

@router.post("/create_daily_plan")
async def create_daily_plan(request: MealIdeaRequest):
    """Create a coordinated daily meal plan"""
    try:
        logger.info(f"Creating daily plan for meal idea: {request.meal_idea}")
        
        plan = tracker.create_daily_plan(request.meal_idea)
        
        if plan is None:
            raise HTTPException(status_code=500, detail="Failed to create coordinated meal plan")
        
        # Convert to dict for JSON response
        plan_dict = plan.model_dump()
        logger.info(f"Successfully created plan for: {plan.main_meal_plan.meal_name}")
        
        return plan_dict
        
    except Exception as e:
        logger.error(f"Error creating daily plan: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create daily plan: {str(e)}")

@router.post("/log_meal")
async def log_meal(request: MealLogRequest):
    """Log a family meal"""
    try:
        meal_data = request.model_dump()
        nudge = tracker.log_family_meal(meal_data)
        
        response = {
            "success": True,
            "message": "Meal logged successfully"
        }
        
        if nudge:
            response["nudge"] = nudge.model_dump()
        
        return response
        
    except Exception as e:
        logger.error(f"Error logging meal: {e}")
        raise HTTPException(status_code=500, detail="Failed to log meal")

@router.post("/log_deviation")
async def log_deviation(request: DeviationRequest):
    """Log a meal deviation and get adaptive nudge"""
    try:
        nudge = tracker.log_meal_deviation_and_nudge(
            request.member_name, 
            request.deviation_description
        )
        
        response = {
            "success": True,
            "message": "Deviation logged successfully"
        }
        
        if nudge:
            response["nudge"] = nudge.model_dump()
        
        return response
        
    except Exception as e:
        logger.error(f"Error logging deviation: {e}")
        raise HTTPException(status_code=500, detail="Failed to log deviation")

@router.get("/meal_suggestion")
async def get_meal_suggestion():
    """Get an AI-suggested meal idea"""
    try:
        suggestion = tracker.get_meal_suggestion()
        return {"suggestion": suggestion}
        
    except Exception as e:
        logger.error(f"Error getting meal suggestion: {e}")
        raise HTTPException(status_code=500, detail="Failed to get meal suggestion")

@router.get("/nudges/{date}")
async def get_nudges(date: str):
    """Get nudges for a specific date"""
    try:
        nudges = tracker.get_daily_nudges(date)
        return {
            "date": date,
            "nudges": [nudge.model_dump() for nudge in nudges]
        }
        
    except Exception as e:
        logger.error(f"Error getting nudges: {e}")
        raise HTTPException(status_code=500, detail="Failed to get nudges")

@router.get("/meal_logs")
async def get_meal_logs(days: int = 7):
    """Get recent meal logs"""
    try:
        logs = tracker.get_recent_meal_logs(days)
        return {
            "logs": [log.model_dump() for log in logs],
            "total_logs": len(logs)
        }
        
    except Exception as e:
        logger.error(f"Error getting meal logs: {e}")
        raise HTTPException(status_code=500, detail="Failed to get meal logs")

@router.get("/enhanced_report")
async def get_enhanced_report():
    """Generate enhanced family health report"""
    try:
        report = tracker.generate_enhanced_report()
        return report.model_dump()
        
    except Exception as e:
        logger.error(f"Error generating enhanced report: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate enhanced report")

@router.get("/recipes/all")
async def get_all_recipes():
    """Get all recipes from recipes1.json"""
    try:
        # Load recipes from recipes1.json
        recipes_file = os.path.join(os.path.dirname(__file__), "recipes1.json")
        
        if not os.path.exists(recipes_file):
            raise HTTPException(status_code=404, detail="Recipes file not found")
        
        with open(recipes_file, 'r', encoding='utf-8') as f:
            recipes_data = json.load(f)
        
        # Handle different JSON structures
        if isinstance(recipes_data, list):
            recipes = recipes_data
        elif isinstance(recipes_data, dict) and 'recipes' in recipes_data:
            recipes = recipes_data['recipes']
        else:
            recipes = [recipes_data]  # Single recipe object
        
        # Ensure each recipe has an ID
        for i, recipe in enumerate(recipes):
            if 'id' not in recipe:
                recipe['id'] = f"recipe_{i}"
        
        return {
            "recipes": recipes,
            "total": len(recipes)
        }
        
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Recipes file not found")
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Invalid JSON format in recipes file")
    except Exception as e:
        logger.error(f"Error loading recipes: {e}")
        raise HTTPException(status_code=500, detail="Failed to load recipes")

@router.post("/recipes/recommendations")
async def get_recipe_recommendations(request: RecipeRecommendationRequest):
    """Get AI-powered recipe recommendations based on user query"""
    try:
        logger.info(f"Getting recipe recommendations for query: {request.query}")
        
        # Use the same Gemini client from FamilyNutritionTracker
        from google import genai
        from google.genai import types
        
        client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))
        
        # Build context from user preferences
        preferences = request.preferences or {}
        preferences_context = f"""
        User Dietary Preferences: {preferences.get('dietary', 'Balanced')}
        Nutritional Focus: {preferences.get('nutritional', 'General health')}
        Regional Preference: {preferences.get('region', 'Pan-Indian')}
        """
        
        prompt = f"""
        You are an expert in Indian heritage cuisine and personalized nutrition, with special knowledge of traditional ingredients and cooking methods.
        Generate 3-4 personalized recipe recommendations based on the user's query: "{request.query}"
        
        {preferences_context}
        
        For each recipe, provide:
        1. Recipe name with specific regional heritage (e.g., Bengali, Maharashtrian, South Indian, etc.)
        2. Brief description highlighting traditional aspects and health benefits
        3. Key ingredients (emphasizing traditional alternatives common in Indian kitchens)
        4. Why this recipe fits the user's query
        5. Nutritional benefits
        6. Heritage significance or cultural story from specific Indian region or tradition
        7. Preparation time and difficulty level
        
        Format as JSON array with this exact structure:
        [
          {{
            "name": "Recipe Name",
            "description": "Brief description",
            "ingredients": ["ingredient1", "ingredient2", "ingredient3"],
            "whyRecommended": "Explanation of fit with user query",
            "nutritionalBenefits": "Health benefits",
            "heritageSiginificance": "Cultural context from specific Indian region",
            "preparationTime": "X minutes",
            "difficulty": "Easy/Medium/Hard"
          }}
        ]
        
        Return ONLY the JSON array, no additional text.
        """
        
        # Call the LLM
        response = client.models.generate_content(
            model="models/gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(temperature=0.7)
        )
        
        if response.text:
            # Clean and parse response
            cleaned_text = response.text.strip()
            if cleaned_text.startswith("```json"):
                cleaned_text = cleaned_text[7:]
            if cleaned_text.startswith("```"):
                cleaned_text = cleaned_text[3:]
            if cleaned_text.endswith("```"):
                cleaned_text = cleaned_text[:-3]
            cleaned_text = cleaned_text.strip()
            
            try:
                recommendations = json.loads(cleaned_text)
                logger.info(f"Successfully generated {len(recommendations)} recommendations")
                
                return {
                    "success": True,
                    "recommendations": recommendations,
                    "query": request.query
                }
                
            except json.JSONDecodeError:
                logger.error("Failed to parse AI response as JSON")
                raise HTTPException(status_code=500, detail="Failed to parse AI response")
        else:
            raise HTTPException(status_code=500, detail="Empty response from AI")
            
    except Exception as e:
        logger.error(f"Error generating recipe recommendations: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate recommendations: {str(e)}")


