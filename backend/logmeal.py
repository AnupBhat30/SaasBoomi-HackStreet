import os
import json
from pymongo import MongoClient
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn

# Load environment variables from .env file
load_dotenv()

# MongoDB Atlas connection details
MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = "FoodData"  # Replace with your database name
COLLECTION_NAME = "food_collection"  # Replace with your collection name

# FastAPI router
router = APIRouter()

# Pydantic models
class SearchResult(BaseModel):
    dish_name: Optional[str] = None
    ingredients: Optional[List[str]] = []
    calories_kcal: Optional[float] = None
    protein_g: Optional[float] = None
    cuisine: Optional[str] = None
    meal_type: Optional[str] = None
    score: Optional[float] = None

class SearchResponse(BaseModel):
    query: str
    results: List[SearchResult]
    total_results: int
    search_type: str

def connect_to_mongodb():
    """
    Establish connection to MongoDB Atlas.

    Returns:
        MongoClient: Connected MongoDB client
        database: Database object
        collection: Collection object
    """
    try:
        # Create MongoDB client
        client = MongoClient(MONGO_URI)

        # Test the connection
        client.admin.command('ping')
        print("✅ Successfully connected to MongoDB Atlas!")

        # Get database and collection
        database = client[DATABASE_NAME]
        collection = database[COLLECTION_NAME]

        return client, database, collection

    except Exception as e:
        print(f"❌ Failed to connect to MongoDB Atlas: {e}")
        return None, None, None

def run_atlas_search_query(collection, query, search_path="dish_name", index_name="default", limit=10):
    """
    Run an Atlas Search query on the specified collection.

    Args:
        collection: MongoDB collection object
        query (str): Search query string
        search_path (str): Field to search in (default: "dish_name")
        index_name (str): Name of the Atlas Search index (default: "default")
        limit (int): Maximum number of results to return

    Returns:
        list: List of matching documents
    """
    try:
        # Define the aggregation pipeline for Atlas Search
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
                    "_id": 0,  # Exclude the _id field from results
                    "dish_name": 1,
                    "ingredients": 1,
                    "calories_kcal": 1,
                    "protein_g": 1,
                    "cuisine": 1,
                    "meal_type": 1,
                    "score": {"$meta": "searchScore"}  # Include search relevance score
                }
            }
        ]

        # Execute the aggregation pipeline
        results = list(collection.aggregate(pipeline))

        print(f"🔍 Found {len(results)} results for query: '{query}'")
        return results

    except Exception as e:
        print(f"❌ Atlas Search query failed: {e}")
        print("💡 This might be due to:")
        print("   - Atlas Search index not configured")
        print("   - Incorrect index name")
        print("   - Network connectivity issues")
        return []

def run_atlas_search_with_fallback(collection, query, search_path="dish_name", index_name="default", limit=10):
    """
    Run Atlas Search with regex fallback if Atlas Search fails.

    Args:
        collection: MongoDB collection object
        query (str): Search query string
        search_path (str): Field to search in
        index_name (str): Name of the Atlas Search index
        limit (int): Maximum number of results to return

    Returns:
        list: List of matching documents
    """
    # First, try Atlas Search
    results = run_atlas_search_query(collection, query, search_path, index_name, limit)

    # If no results from Atlas Search, try regex fallback
    if not results:
        print("🔄 Atlas Search returned no results, trying regex fallback...")
        try:
            # Create a regex pattern for case-insensitive search
            regex_pattern = {"$regex": query, "$options": "i"}

            # Search using regex
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

        except Exception as e:
            print(f"❌ Regex fallback also failed: {e}")
            results = []

    return results

def search_recipes_by_ingredients(collection, ingredients_list, index_name="default", limit=10):
    """
    Search for recipes that contain specific ingredients using Atlas Search.

    Args:
        collection: MongoDB collection object
        ingredients_list (list): List of ingredient names to search for
        index_name (str): Name of the Atlas Search index
        limit (int): Maximum number of results to return

    Returns:
        list: List of matching recipes
    """
    try:
        # Create a compound query for multiple ingredients
        should_clauses = []
        for ingredient in ingredients_list:
            should_clauses.append({
                "text": {
                    "query": ingredient,
                    "path": "ingredients"
                }
            })

        pipeline = [
            {
                "$search": {
                    "index": index_name,
                    "compound": {
                        "should": should_clauses,
                        "minimumShouldMatch": 1  # At least one ingredient should match
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
        print(f"🔍 Found {len(results)} recipes containing ingredients: {ingredients_list}")
        return results

    except Exception as e:
        print(f"❌ Ingredient search failed: {e}")
        return []

# FastAPI Endpoints
@router.get("/")
async def root():
    return {"message": "Recipe Search API", "version": "1.0.0", "status": "running"}

@router.get("/health")
async def health_check():
    """Health check endpoint for mobile app connectivity"""
    try:
        # Test MongoDB connection
        client, database, collection = connect_to_mongodb()
        if client:
            client.close()
            return {
                "status": "healthy",
                "database": "connected",
                "timestamp": "2025-08-31"
            }
        else:
            return {
                "status": "unhealthy",
                "database": "disconnected",
                "error": "MongoDB connection failed"
            }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }

@router.get("/api/search/recipes", response_model=SearchResponse)
async def search_recipes(
    q: str = Query(..., description="Search query for recipes"),
    limit: int = Query(10, description="Maximum number of results", ge=1, le=50),
    search_type: str = Query("dish_name", description="Field to search in: dish_name, ingredients, cuisine")
):
    """
    Search for recipes using MongoDB Atlas Search
    """
    try:
        print(f"🔍 Search request: q='{q}', limit={limit}, type='{search_type}'")

        # Connect to MongoDB
        client, database, collection = connect_to_mongodb()
        if collection is None:
            print("❌ Database connection failed")
            raise HTTPException(status_code=500, detail="Database connection failed")

        # Perform search based on type
        if search_type == "ingredients":
            results = search_recipes_by_ingredients(collection, [q], limit=limit)
        else:
            results = run_atlas_search_with_fallback(collection, q, search_path=search_type, limit=limit)

        # Close connection
        if client:
            client.close()

        # Format results
        formatted_results = []
        for result in results:
            formatted_results.append(SearchResult(**result))

        print(f"✅ Search completed: found {len(formatted_results)} results")

        return SearchResponse(
            query=q,
            results=formatted_results,
            total_results=len(formatted_results),
            search_type=search_type
        )

    except Exception as e:
        print(f"❌ Search failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@router.get("/api/search/ingredients")
async def search_by_ingredients(
    ingredients: str = Query(..., description="Comma-separated list of ingredients"),
    limit: int = Query(10, description="Maximum number of results", ge=1, le=50)
):
    """
    Search for recipes containing specific ingredients
    """
    try:
        # Parse ingredients
        ingredients_list = [ing.strip() for ing in ingredients.split(",") if ing.strip()]

        if not ingredients_list:
            raise HTTPException(status_code=400, detail="No valid ingredients provided")

        # Connect to MongoDB
        client, database, collection = connect_to_mongodb()
        if collection is None:
            raise HTTPException(status_code=500, detail="Database connection failed")

        # Perform ingredient search
        results = search_recipes_by_ingredients(collection, ingredients_list, limit=limit)

        # Close connection
        if client:
            client.close()

        # Format results
        formatted_results = []
        for result in results:
            formatted_results.append(SearchResult(**result))

        return SearchResponse(
            query=ingredients,
            results=formatted_results,
            total_results=len(formatted_results),
            search_type="ingredients"
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ingredient search failed: {str(e)}")

@router.get("/api/recipes/suggestions")
async def get_recipe_suggestions(
    meal_type: Optional[str] = Query(None, description="Filter by meal type: breakfast, lunch, dinner, snacks"),
    cuisine: Optional[str] = Query(None, description="Filter by cuisine"),
    limit: int = Query(5, description="Number of suggestions", ge=1, le=20)
):
    """
    Get recipe suggestions with optional filters
    """
    try:
        # Connect to MongoDB
        client, database, collection = connect_to_mongodb()
        if collection is None:
            raise HTTPException(status_code=500, detail="Database connection failed")

        # Build query
        query = {}
        if meal_type:
            query["meal_type"] = {"$regex": meal_type, "$options": "i"}
        if cuisine:
            query["cuisine"] = {"$regex": cuisine, "$options": "i"}

        # Get random suggestions
        pipeline = [
            {"$match": query} if query else {"$match": {}},
            {"$sample": {"size": limit}},
            {"$project": {
                "_id": 0,
                "dish_name": 1,
                "ingredients": 1,
                "calories_kcal": 1,
                "protein_g": 1,
                "cuisine": 1,
                "meal_type": 1
            }}
        ]

        results = list(collection.aggregate(pipeline))

        # Close connection
        if client:
            client.close()

        # Format results
        formatted_results = []
        for result in results:
            formatted_results.append(SearchResult(**result))

        return SearchResponse(
            query=f"meal_type:{meal_type}, cuisine:{cuisine}",
            results=formatted_results,
            total_results=len(formatted_results),
            search_type="suggestions"
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Suggestions failed: {str(e)}")

def print_search_results(results):
    """
    Pretty print the search results.

    Args:
        results (list): List of search result documents
    """
    if not results:
        print("📭 No results found.")
        return

    print("\n" + "="*80)
    print("🍽️  SEARCH RESULTS")
    print("="*80)

    for i, result in enumerate(results, 1):
        print(f"\n{i}. {result.get('dish_name', 'Unknown Dish')}")
        print("-" * 40)

        if 'cuisine' in result:
            print(f"   🍳 Cuisine: {result['cuisine']}")
        if 'meal_type' in result:
            print(f"   🕐 Meal Type: {result['meal_type']}")
        if 'calories_kcal' in result:
            print(f"   🔥 Calories: {result['calories_kcal']} kcal")
        if 'protein_g' in result:
            print(f"   💪 Protein: {result['protein_g']}g")
        if 'score' in result:
            print(".2f")
        if 'ingredients' in result:
            ingredients = result['ingredients']
            if isinstance(ingredients, list):
                print(f"   🥕 Ingredients: {', '.join(ingredients[:5])}" + ("..." if len(ingredients) > 5 else ""))
            else:
                print(f"   🥕 Ingredients: {ingredients}")

def main():
    """
    Main function demonstrating MongoDB Atlas Search functionality.
    """
    print("🚀 Starting MongoDB Atlas Search Demo")
    print("="*50)

    # Connect to MongoDB
    client, database, collection = connect_to_mongodb()

    if collection is None:
        print("❌ Cannot proceed without MongoDB connection.")
        return

    # Example 1: Basic text search
    print("\n" + "="*50)
    print("📖 EXAMPLE 1: Basic Text Search")
    print("="*50)

    search_query = "chicken curry"
    print(f"Searching for: '{search_query}'")

    results = run_atlas_search_with_fallback(collection, search_query)
    print_search_results(results)

    # Example 2: Search by ingredients
    print("\n" + "="*50)
    print("🥕 EXAMPLE 2: Search by Ingredients")
    print("="*50)

    ingredients_to_search = ["chicken", "rice"]
    print(f"Searching for recipes containing: {ingredients_to_search}")

    ingredient_results = search_recipes_by_ingredients(collection, ingredients_to_search)
    print_search_results(ingredient_results)

    # Example 3: Search with different field
    print("\n" + "="*50)
    print("🔍 EXAMPLE 3: Search in Cuisine Field")
    print("="*50)

    cuisine_query = "indian"
    print(f"Searching for cuisine: '{cuisine_query}'")

    cuisine_results = run_atlas_search_with_fallback(collection, cuisine_query, search_path="cuisine")
    print_search_results(cuisine_results)

    # Close the connection
    if client:
        client.close()
        print("\n🔌 MongoDB connection closed.")


