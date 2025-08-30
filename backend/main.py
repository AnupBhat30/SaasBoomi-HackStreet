from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
import json
import os
from datetime import datetime
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB Atlas connection details
MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = "FoodData"
COLLECTION_NAME = "food_collection"

from family import (
    FamilyHealthReport,
    CoordinatedPlan,
    NutritionalTargets,
    DailyMealPlan,
    MealSuggestion,
    MealLog
)

app = FastAPI(title="Heritage Nutrition AI API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for API requests/responses
class FamilyMember(BaseModel):
    name: str
    age: int
    health_conditions: List[str] = []
    dietary_restrictions: List[str] = []
    activity_level: str = "moderate"

class FamilyProfile(BaseModel):
    members: List[FamilyMember]

class MealLogRequest(BaseModel):
    member_name: str
    meal_type: str
    foods: List[str]
    notes: Optional[str] = ""
    satisfaction_rating: Optional[int] = None

class DeviationLog(BaseModel):
    member_name: str
    deviation_description: str
    timestamp: Optional[str] = None

# Mock data storage (in production, use a database)
family_profiles = {}
meal_logs = []
deviation_logs = []

def connect_to_mongodb():
    """
    Establish connection to MongoDB Atlas.
    Returns: (client, database, collection) or (None, None, None) if failed
    """
    try:
        client = MongoClient(MONGO_URI)
        client.admin.command('ping')
        database = client[DATABASE_NAME]
        collection = database[COLLECTION_NAME]
        return client, database, collection
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB Atlas: {e}")
        return None, None, None

def run_atlas_search_with_fallback(collection, query, search_path="dish_name", index_name="default", limit=10):
    """
    Run Atlas Search with regex fallback if Atlas Search fails.
    """
    try:
        # First, try Atlas Search
        pipeline = [
            {
                "$search": {
                    "index": index_name,
                    "text": {
                        "query": query,
                        "path": search_path
                    }
                }
            },
            {
                "$limit": limit
            },
            {
                "$project": {
                    "_id": 0,
                    "dish_name": 1,
                    "ingredients": 1,
                    "calories_kcal": 1,
                    "protein_g": 1,
                    "cuisine": 1,
                    "meal_type": 1,
                    "score": {"$meta": "searchScore"}
                }
            }
        ]
        
        results = list(collection.aggregate(pipeline))
        if results:
            print(f"🔍 Atlas Search found {len(results)} results for query: '{query}'")
            return results
            
    except Exception as e:
        print(f"❌ Atlas Search failed: {e}")
    
    # Fallback to regex search
    try:
        print(f"🔄 Using regex fallback for query: '{query}'")
        regex_pattern = {"$regex": query, "$options": "i"}
        cursor = collection.find(
            {search_path: regex_pattern},
            {
                "_id": 0,
                "dish_name": 1,
                "ingredients": 1,
                "calories_kcal": 1,
                "protein_g": 1,
                "cuisine": 1,
                "meal_type": 1
            }
        ).limit(limit)
        
        results = list(cursor)
        print(f"🔍 Regex fallback found {len(results)} results for query: '{query}'")
        return results
        
    except Exception as e:
        print(f"❌ Regex fallback also failed: {e}")
        return []

@app.get("/")
async def root():
    return {"message": "Heritage Nutrition AI API", "version": "1.0.0"}

@app.post("/api/family/profile")
async def create_family_profile(profile: FamilyProfile):
    """Create or update family profile"""
    profile_id = "default_family"  # In production, generate unique ID
    family_profiles[profile_id] = profile.dict()
    return {"profile_id": profile_id, "message": "Family profile created successfully"}

@app.get("/api/family/profile/{profile_id}")
async def get_family_profile(profile_id: str):
    """Get family profile"""
    if profile_id not in family_profiles:
        raise HTTPException(status_code=404, detail="Family profile not found")
    return family_profiles[profile_id]

@app.post("/api/nutrition/daily-plan")
async def generate_daily_plan(profile_id: str = "default_family"):
    """Generate daily nutrition plan based on family profile"""
    if profile_id not in family_profiles:
        # Return mock data if no profile exists
        return get_mock_daily_plan()

    # In production, integrate with family.py logic
    # For now, return mock data
    return get_mock_daily_plan()

@app.post("/api/meal/log")
async def log_meal(meal_log: MealLogRequest):
    """Log a meal for tracking"""
    log_entry = {
        "id": len(meal_logs) + 1,
        "date": datetime.now().strftime("%Y-%m-%d"),
        "time_logged": datetime.now().strftime("%H:%M:%S"),
        **meal_log.dict()
    }
    meal_logs.append(log_entry)
    return {"message": "Meal logged successfully", "log_id": log_entry["id"]}

@app.get("/api/meal/logs")
async def get_meal_logs(member_name: Optional[str] = None, date: Optional[str] = None):
    """Get meal logs with optional filtering"""
    filtered_logs = meal_logs

    if member_name:
        filtered_logs = [log for log in filtered_logs if log["member_name"] == member_name]

    if date:
        filtered_logs = [log for log in filtered_logs if log["date"] == date]

    return {"meal_logs": filtered_logs}

@app.post("/api/deviation/log")
async def log_deviation(deviation: DeviationLog):
    """Log a deviation from the nutrition plan"""
    log_entry = {
        "id": len(deviation_logs) + 1,
        "timestamp": deviation.timestamp or datetime.now().isoformat(),
        **deviation.dict()
    }
    deviation_logs.append(log_entry)

    # Generate adaptive nudge based on deviation
    nudge = generate_adaptive_nudge(deviation.deviation_description)

    return {
        "message": "Deviation logged successfully",
        "log_id": log_entry["id"],
        "adaptive_nudge": nudge
    }

@app.get("/api/deviation/logs")
async def get_deviation_logs(member_name: Optional[str] = None):
    """Get deviation logs"""
    filtered_logs = deviation_logs

    if member_name:
        filtered_logs = [log for log in filtered_logs if log["member_name"] == member_name]

    return {"deviation_logs": filtered_logs}

@app.get("/api/nutrition/insights")
async def get_nutrition_insights(profile_id: str = "default_family"):
    """Get nutrition insights and recommendations"""
    # Mock insights - in production, integrate with AI analysis
    return {
        "health_snapshot": "Your family is making great progress with balanced nutrition!",
        "today_focus": "Focus on increasing vegetable intake by 20%",
        "condition_specific_advice": {
            "Priya": "Continue with vitamin-rich vegetables for energy boost",
            "Rajesh": "Monitor sodium intake for blood pressure management",
            "Sunita": "Brown rice substitution is helping with blood sugar control"
        },
        "weekly_progress": {
            "calories_target_achieved": 85,
            "protein_target_achieved": 78,
            "vegetable_intake": 92
        }
    }

@app.post("/api/nutrition/generate-plan")
async def generate_new_plan(profile_id: str = "default_family"):
    """Generate a new nutrition plan with AI optimization"""
    # Mock plan generation - in production, integrate with AI
    return {
        "message": "New nutrition plan generated successfully",
        "plan_id": f"plan_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
        "generated_at": datetime.now().isoformat(),
        "optimizations_applied": [
            "Reduced sodium content for hypertension management",
            "Increased fiber content for blood sugar control",
            "Added vitamin-rich vegetables for overall health"
        ]
    }

def get_mock_daily_plan():
    """Return mock daily plan data"""
    return {
        "date": datetime.now().strftime("%Y-%m-%d"),
        "main_meal_plan": {
            "meal_name": "Rajma Chawal",
            "base_ingredients": ["Kidney beans", "Rice", "Onions", "Tomatoes", "Spices", "Vegetables"],
            "unified_prep_steps": [
                "Soak rajma overnight",
                "Cook rice separately",
                "Saute onions and tomatoes, add spices and rajma"
            ],
            "modifications": [
                {
                    "member_name": "Priya",
                    "modification_details": "Add extra vegetables like carrots",
                    "reason": "For vitamin boost",
                    "portion_size": "1 cup"
                },
                {
                    "member_name": "Rajesh",
                    "modification_details": "Reduce salt, add herbs",
                    "reason": "For hypertension",
                    "portion_size": "1.5 cups"
                },
                {
                    "member_name": "Sunita",
                    "modification_details": "Use brown rice substitute",
                    "reason": "For blood sugar control",
                    "portion_size": "1 cup"
                }
            ],
            "serving_instructions": "Serve hot with yogurt on the side"
        },
        "suggested_other_meals": {
            "breakfast": "Vegetable poha",
            "snacks": "Fruits and nuts"
        },
        "nutritional_targets": {
            "calories_target": "1800-2200 kcal",
            "protein_target": "60-80g",
            "key_nutrients": ["Vitamin C", "Fiber", "Iron", "Calcium"]
        }
    }

def generate_adaptive_nudge(deviation_description: str):
    """Generate adaptive nudge based on deviation"""
    # Simple rule-based nudge generation
    if "samosa" in deviation_description.lower() or "fried" in deviation_description.lower():
        return {
            "message": "That's okay! Let's balance it out with healthier choices.",
            "suggestions": [
                "Add a fresh salad to your next meal",
                "Include more vegetables in dinner",
                "Try baked alternatives next time"
            ]
        }
    elif "sweet" in deviation_description.lower() or "sugar" in deviation_description.lower():
        return {
            "message": "Good awareness! Let's focus on natural sweetness.",
            "suggestions": [
                "Try fruits for natural sweetness",
                "Use cinnamon or cardamom for flavor",
                "Monitor portion sizes of sweet foods"
            ]
        }
    else:
        return {
            "message": "Thanks for logging! Every choice helps us learn.",
            "suggestions": [
                "Stay hydrated throughout the day",
                "Include colorful vegetables in meals",
                "Take a mindful moment before eating"
            ]
        }

@app.get("/search_foods")
async def search_foods(query: str = "", limit: int = 10):
    """Search for foods using MongoDB Atlas search"""
    try:
        # Connect to MongoDB
        client, database, collection = connect_to_mongodb()
        if collection is None:
            raise HTTPException(status_code=500, detail="Database connection failed")
        
        if not query:
            # Return some random samples if no query provided
            try:
                pipeline = [
                    {"$sample": {"size": limit}},
                    {"$project": {
                        "_id": 0,
                        "dish_name": 1,
                        "calories_kcal": 1,
                        "protein_g": 1,
                        "cuisine": 1,
                        "meal_type": 1
                    }}
                ]
                results = list(collection.aggregate(pipeline))
            except:
                # Fallback to find if aggregation fails
                results = list(collection.find({}, {
                    "_id": 0,
                    "dish_name": 1,
                    "calories_kcal": 1,
                    "protein_g": 1,
                    "cuisine": 1,
                    "meal_type": 1
                }).limit(limit))
        else:
            # Search using Atlas Search with fallback
            results = run_atlas_search_with_fallback(collection, query, limit=limit)
        
        # Close connection
        if client:
            client.close()
        
        # Transform results to match frontend expectations
        formatted_results = []
        for result in results:
            formatted_food = {
                "name": result.get("dish_name", "Unknown"),
                "calories": round(result.get("calories_kcal", 0)),
                "protein": round(result.get("protein_g", 0), 1),
                "carbs": 0,  # Not available in current MongoDB schema
                "fat": 0,    # Not available in current MongoDB schema
                "unit": "serving"
            }
            formatted_results.append(formatted_food)
        
        print(f"✅ Search completed: found {len(formatted_results)} results for query: '{query}'")
        return formatted_results
        
    except Exception as e:
        print(f"❌ Search failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@app.post("/store_meal_log")
async def store_meal_log(data: dict):
    """Store meal log data"""
    try:
        meal_log = data.get("mealLog", {})
        
        # Store to file
        meal_log_file = "meal_log.json"
        with open(meal_log_file, "w", encoding="utf-8") as f:
            json.dump(meal_log, f, ensure_ascii=False, indent=2)
        
        print("Meal log stored successfully:", meal_log)
        return {"message": "Meal log stored successfully"}
        
    except Exception as e:
        print(f"Error storing meal log: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to store meal log: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
