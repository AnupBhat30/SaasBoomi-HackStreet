import os
import json
import logging
from datetime import datetime, timedelta
from google import genai
from google.genai import types
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
import uuid

# Pydantic models for structured output
class NutritionalTargets(BaseModel):
    calories_target: str = Field(description="Recommended daily calorie range for the family")
    protein_target: str = Field(description="Protein intake recommendation")
    key_nutrients: List[str] = Field(description="Essential nutrients to focus on based on family conditions")

class MealSuggestion(BaseModel):
    meal_name: str = Field(description="Name of the suggested meal")
    ingredients: List[str] = Field(description="Key ingredients needed")
    nutritional_highlights: str = Field(description="Key nutritional benefits")
    prep_time: str = Field(description="Preparation time")
    calories: str = Field(description="Approximate calories per serving")

class DailyMealPlan(BaseModel):
    breakfast: MealSuggestion = Field(description="Breakfast suggestion")
    lunch: MealSuggestion = Field(description="Lunch suggestion")
    dinner: MealSuggestion = Field(description="Dinner suggestion")
    snacks: List[str] = Field(description="Healthy snack options")

class CoordinatedPlan(BaseModel):
    nutritional_targets: NutritionalTargets = Field(description="Family's daily nutritional goals")
    meal_plan: DailyMealPlan = Field(description="Complete daily meal plan")
    shopping_list: List[str] = Field(description="Essential items to buy")
    prep_tips: List[str] = Field(description="Practical preparation tips")

class FamilyHealthReport(BaseModel):
    health_snapshot: str = Field(description="A brief, encouraging overview of the family's current health landscape with specific nutritional focus.")
    today_s_focus: str = Field(description="Identify the most impactful nutritional area for improvement today with measurable goals.")
    condition_specific_advice: Dict[str, str] = Field(description="Targeted nutritional advice for each family member's specific health conditions.")
    coordinated_plan: CoordinatedPlan = Field(description="The coordinated nutritional plan for the family.")

# New models for meal logging and nudging
class MealLog(BaseModel):
    date: str = Field(description="Date of the meal in YYYY-MM-DD format")
    meal_type: str = Field(description="Type of meal: breakfast, lunch, dinner, snacks")
    foods: List[str] = Field(description="List of foods consumed")
    time_logged: str = Field(description="Time when meal was logged")
    satisfaction_rating: Optional[int] = Field(description="User satisfaction rating 1-5", default=None)
    notes: Optional[str] = Field(description="Additional notes about the meal", default="")

class NutritionNudge(BaseModel):
    nudge_id: str = Field(description="Unique identifier for the nudge")
    date: str = Field(description="Date for which nudge is relevant")
    meal_type: str = Field(description="Target meal type: breakfast, lunch, dinner, snacks")
    nudge_type: str = Field(description="Type: immediate_next_meal, end_of_day_summary, weekly_reflection")
    message: str = Field(description="The nudge message")
    suggestions: List[str] = Field(description="Specific actionable suggestions")
    nutritional_focus: str = Field(description="Primary nutritional area being addressed")
    urgency_level: str = Field(description="low, medium, high")
    context: Dict[str, Any] = Field(description="Additional context for the nudge")

# New models for proactive daily planning
class MealModification(BaseModel):
    member_name: str = Field(description="The name of the family member")
    modification_details: str = Field(description="The specific instruction, e.g., 'Add a spoonful of ghee to his serving.'")
    reason: str = Field(description="A short explanation, e.g., 'for healthy weight gain.'")
    portion_size: str = Field(description="The recommended portion for this person")

class CoordinatedMeal(BaseModel):
    meal_name: str = Field(description="The name of the meal being planned")
    base_ingredients: List[str] = Field(description="A shopping list for the core recipe")
    unified_prep_steps: List[str] = Field(description="The preparation steps that are common for everyone")
    modifications: List[MealModification] = Field(description="A list containing the specific adjustments for each family member")
    serving_instructions: str = Field(description="Final instructions on how to serve the different portions")

class DailyPlan(BaseModel):
    date: str = Field(description="The date of the plan")
    main_meal_plan: CoordinatedMeal = Field(description="The detailed plan for the day's main meal")
    suggested_other_meals: Dict[str, str] = Field(description="Simple text suggestions for other meals like breakfast and snacks")

class FamilyNutritionTracker:
    """Enhanced family nutrition system with meal logging and personalized nudges."""

    def __init__(self):
        self.api_key = os.getenv("GOOGLE_API_KEY")
        if not self.api_key:
            raise ValueError("GOOGLE_API_KEY not found in environment variables.")
        self.client = genai.Client(api_key=self.api_key)

        # Initialize family data
        self.family_profiles = self._load_family_profiles()
        self.meal_logs = []
        self.nudges = []
        self.current_daily_plan = None  # Track the day's plan for context-aware nudges
        self._load_existing_data()

    def _load_family_profiles(self):
        """Load family profiles from JSON file or use defaults."""
        try:
            if os.path.exists("family_data.json"):
                with open("family_data.json", "r", encoding="utf-8") as f:
                    return json.load(f)
        except Exception as e:
            logger.warning(f"Could not load family_data.json: {e}")

        # Default family profiles
        return [
            {
                "name": "Priya", "role": "Student", "BMI": 18.5, "gender": "Female",
                "health_conditions": ["Vitamin D deficiency", "Anemia"],
                "health_goals": ["Healthier lifestyle", "Nutritious meals"],
                "access_to_kitchen": "rarely", "stress_level": "high", "meal_source": "fast_food"
            },
            {
                "name": "Rajesh", "role": "Father", "BMI": 26, "gender": "Male",
                "health_conditions": ["Hypertension"],
                "health_goals": ["Reduce blood pressure", "Lose weight"],
                "access_to_kitchen": "always", "stress_level": "moderate", "meal_source": "home_cooked"
            },
            {
                "name": "Sunita", "role": "Mother (Primary Cook)", "BMI": 28, "gender": "Female",
                "health_conditions": ["Pre-diabetic"],
                "health_goals": ["Manage blood sugar", "Lose weight"],
                "access_to_kitchen": "always", "stress_level": "moderate", "meal_source": "home_cooked"
            }
        ]

    def _load_existing_data(self):
        """Load existing meal logs and nudges."""
        try:
            if os.path.exists("family_meal_logs.json"):
                with open("family_meal_logs.json", "r", encoding="utf-8") as f:
                    logs_data = json.load(f)
                    self.meal_logs = [MealLog(**log) for log in logs_data]
        except Exception as e:
            logger.warning(f"Could not load meal logs: {e}")

        try:
            if os.path.exists("family_nudges.json"):
                with open("family_nudges.json", "r", encoding="utf-8") as f:
                    nudges_data = json.load(f)
                    self.nudges = [NutritionNudge(**nudge) for nudge in nudges_data]
        except Exception as e:
            logger.warning(f"Could not load nudges: {e}")

    def log_family_meal(self, meal_data: Dict[str, Any]) -> Optional[NutritionNudge]:
        """Log a meal for a family member and generate personalized nudge."""
        try:
            meal_log = MealLog(**meal_data)
            self.meal_logs.append(meal_log)

            # Generate nudge based on the meal
            nudge = self._generate_meal_nudge(meal_log)

            if nudge:
                self.nudges.append(nudge)

            # Save data
            self._save_meal_logs()
            if nudge:
                self._save_nudges()

            return nudge

        except Exception as e:
            logger.error(f"Failed to log meal: {e}")
            return None

    def _generate_meal_nudge(self, recent_meal: MealLog) -> Optional[NutritionNudge]:
        """Generate a personalized nudge based on recent meal."""
        nudge_id = str(uuid.uuid4())
        today = datetime.now().strftime("%Y-%m-%d")

        # Determine next meal type
        next_meal_type = self._get_next_meal_type(recent_meal.meal_type)

        # Analyze recent meal for nutritional gaps
        analysis = self._analyze_meal_nutrition(recent_meal)

        if analysis["needs_improvement"]:
            nudge = NutritionNudge(
                nudge_id=nudge_id,
                date=today,
                meal_type=next_meal_type,
                nudge_type="immediate_next_meal",
                message=analysis["message"],
                suggestions=analysis["suggestions"],
                nutritional_focus=analysis["focus_area"],
                urgency_level=analysis["urgency"],
                context={
                    "recent_meal": recent_meal.meal_type,
                    "gaps_identified": analysis["gaps"],
                    "family_member": self._identify_family_member(recent_meal)
                }
            )
            return nudge

        return None

    def _get_next_meal_type(self, current_meal: str) -> str:
        """Determine the next logical meal type."""
        meal_order = ["breakfast", "lunch", "snacks", "dinner"]
        try:
            current_index = meal_order.index(current_meal.lower())
            next_index = (current_index + 1) % len(meal_order)
            return meal_order[next_index]
        except ValueError:
            return "lunch"

    def _analyze_meal_nutrition(self, meal: MealLog) -> Dict[str, Any]:
        """Analyze a meal for nutritional content and gaps."""
        foods = [food.lower() for food in meal.foods]

        analysis = {
            "needs_improvement": False,
            "message": "",
            "suggestions": [],
            "focus_area": "",
            "urgency": "low",
            "gaps": []
        }

        # Check for family health conditions
        family_conditions = []
        for profile in self.family_profiles:
            family_conditions.extend(profile.get("health_conditions", []))

        # Anemia-related analysis
        if "anemia" in [c.lower() for c in family_conditions]:
            if not any(keyword in " ".join(foods) for keyword in ["spinach", "lentils", "beans", "meat", "citrus", "vitamin c"]):
                analysis["needs_improvement"] = True
                analysis["message"] = f"Great job logging your {meal.meal_type}! To support anemia management, consider adding iron-rich foods to your next meal."
                analysis["suggestions"] = [
                    "Add spinach or leafy greens for natural iron",
                    "Include citrus fruits or bell peppers for vitamin C absorption",
                    "Try lentils or beans as a protein source"
                ]
                analysis["focus_area"] = "Iron & Vitamin C"
                analysis["urgency"] = "high"
                analysis["gaps"] = ["iron", "vitamin_c"]

        # Check for skipped meals
        if "skipped" in " ".join(foods).lower() or "no time" in " ".join(foods).lower():
            analysis["needs_improvement"] = True
            analysis["message"] = f"I noticed you skipped {meal.meal_type}. Even a small, nutritious option can make a big difference!"
            analysis["suggestions"] = [
                "Try a quick protein shake or yogurt",
                "Keep nuts or fruit handy for busy days",
                "Plan simple meals that take <5 minutes to prepare"
            ]
            analysis["focus_area"] = "Meal Frequency"
            analysis["urgency"] = "medium"

        # Check for fast food patterns
        fast_food_indicators = ["burger", "pizza", "fries", "chips", "cold drink", "soda", "noodles"]
        if any(indicator in " ".join(foods) for indicator in fast_food_indicators):
            analysis["needs_improvement"] = True
            analysis["message"] = f"Your {meal.meal_type} choice is noted! Let's balance it with more nutrient-dense options in your next meal."
            analysis["suggestions"] = [
                "Pair fast food with a side salad or vegetable",
                "Choose grilled options over fried when possible",
                "Add a piece of fruit for natural sweetness"
            ]
            analysis["focus_area"] = "Nutrient Density"
            analysis["urgency"] = "medium"

        return analysis

    def _identify_family_member(self, meal: MealLog) -> str:
        """Identify which family member logged the meal based on context."""
        # Simple heuristic - could be enhanced with user identification
        return "Family Member"

    def get_daily_nudges(self, date: str = None) -> List[NutritionNudge]:
        """Get nudges for a specific date or today."""
        if date is None:
            date = datetime.now().strftime("%Y-%m-%d")

        return [nudge for nudge in self.nudges if nudge.date == date]

    def get_recent_meal_logs(self, days: int = 7) -> List[MealLog]:
        """Get recent meal logs."""
        cutoff_date = datetime.now() - timedelta(days=days)
        return [log for log in self.meal_logs
                if datetime.fromisoformat(log.date) >= cutoff_date]

    def generate_enhanced_report(self) -> FamilyHealthReport:
        """Generate enhanced family health report incorporating meal log data."""
        # Get recent meal logs for context
        recent_logs = self.get_recent_meal_logs(7)

        # Analyze patterns from logged meals
        meal_patterns = self._analyze_meal_patterns(recent_logs)

        # Generate enhanced report with AI
        return self._generate_ai_enhanced_report(meal_patterns)

    def create_daily_plan(self, meal_idea: str) -> Optional[DailyPlan]:
        """Create a proactive daily plan based on meal idea and family profiles."""
        try:
            # Create prompt for the LLM
            json_schema = DailyPlan.model_json_schema()

            family_context = f"""
Family Profiles:
{json.dumps(self.family_profiles, indent=2)}

Meal Idea: {meal_idea}
"""

            prompt = f"""
You are an expert AI nutritionist and chef. A user wants to cook "{meal_idea}" for their family.
Your task is to transform this single idea into a coordinated meal plan that works for everyone's health needs.

Family Profiles:
{json.dumps(self.family_profiles, indent=2)}

Return ONLY a valid JSON object with this EXACT structure:
{{
  "date": "2024-10-27",
  "main_meal_plan": {{
    "meal_name": "{meal_idea}",
    "base_ingredients": ["ingredient1", "ingredient2"],
    "unified_prep_steps": ["step1", "step2"],
    "modifications": [
      {{
        "member_name": "MemberName",
        "modification_details": "specific modification",
        "reason": "health reason",
        "portion_size": "1 cup"
      }}
    ],
    "serving_instructions": "final serving instructions"
  }},
  "suggested_other_meals": {{
    "breakfast": "suggestion",
    "snacks": "suggestion"
  }}
}}

Create member-specific modifications for each family member based on their health conditions."""

            # Call the LLM
            system_instruction = "You are an expert AI nutritionist and chef from India. You are empathetic, practical, and understand the cultural importance of food. Your goal is to help families eat healthier without sacrificing their favorite meals. Your advice should be like talking to a knowledgeable and friendly family member."

            response = self.client.models.generate_content(
                model="models/gemini-2.5-flash",
                contents=f"{system_instruction}\n\n{prompt}",
                config=types.GenerateContentConfig(temperature=0.3)
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

                json_data = json.loads(cleaned_text)
                daily_plan = DailyPlan(**json_data)

                # Store the plan
                self.current_daily_plan = daily_plan
                return daily_plan

        except (json.JSONDecodeError, ValueError) as e:
            logger.error(f"AI response parsing failed for daily plan: {e}")
            print("Sorry, I couldn't create a valid plan right now. There might be a connection issue.")
            return None
        except Exception as e:
            logger.error(f"An unexpected error occurred in create_daily_plan: {e}")
            print("An unexpected error occurred. Please try again later.")
            return None
        return None  # Explicitly return None if the response was empty

    def log_meal_deviation_and_nudge(self, member_name: str, deviation_description: str) -> Optional[NutritionNudge]:
        """Log a meal deviation and generate a context-aware nudge based on the daily plan."""
        try:
            # Check if there's a current daily plan
            if not self.current_daily_plan:
                logger.warning("No current daily plan available for context-aware nudging")
                return None

            # Create prompt for context-aware nudge
            plan_context = f"""
Current Daily Plan:
- Date: {self.current_daily_plan.date}
- Main Meal: {self.current_daily_plan.main_meal_plan.meal_name}
- Base Ingredients: {', '.join(self.current_daily_plan.main_meal_plan.base_ingredients)}
- Family Modifications: {', '.join([f"{mod.member_name}: {mod.modification_details} ({mod.reason})" for mod in self.current_daily_plan.main_meal_plan.modifications])}
- Serving Instructions: {self.current_daily_plan.main_meal_plan.serving_instructions}
- Other Meal Suggestions: {self.current_daily_plan.suggested_other_meals}
"""

            prompt = f"""
You are a supportive and non-judgmental AI nutrition coach.
A family is following a meal plan, but a deviation occurred.

Original Plan Context:
The main meal planned for today is "{self.current_daily_plan.main_meal_plan.meal_name}".

The Deviation:
"{member_name}" consumed "{deviation_description}".

Your Task:
Generate a short, supportive message and a single, very simple suggestion to help them get back on track with their next planned meal.
The suggestion should be a small addition (like a side dish, a drink, or adding a vegetable), not a change to the entire meal.
Keep it positive and encouraging.

Return ONLY a simple JSON object with two keys: "message" and "suggestion".
"""

            # Call the LLM
            system_instruction = "You are a supportive and non-judgmental AI nutrition coach. Your tone is always positive and encouraging. You focus on small, easy steps to help users get back on track without making them feel guilty."

            response = self.client.models.generate_content(
                model="models/gemini-2.5-flash",
                contents=f"{system_instruction}\n\n{prompt}",
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

                json_data = json.loads(cleaned_text)

                # Create NutritionNudge object
                nudge_id = str(uuid.uuid4())
                today = datetime.now().strftime("%Y-%m-%d")

                nudge = NutritionNudge(
                    nudge_id=nudge_id,
                    date=today,
                    meal_type="next_meal",  # Generic next meal
                    nudge_type="immediate_next_meal",
                    message=json_data["message"],
                    suggestions=[json_data["suggestion"]],
                    nutritional_focus="Plan adherence",
                    urgency_level="medium",
                    context={
                        "deviation_member": member_name,
                        "deviation_description": deviation_description,
                        "original_plan_date": self.current_daily_plan.date,
                        "main_meal": self.current_daily_plan.main_meal_plan.meal_name
                    }
                )

                # Add to nudges list
                self.nudges.append(nudge)
                self._save_nudges()

                return nudge

        except (json.JSONDecodeError, ValueError) as e:
            logger.error(f"AI response parsing failed for adaptive nudge: {e}")
            print("Sorry, I couldn't generate a suggestion for that. Let's just focus on the next meal!")
            return None
        except Exception as e:
            logger.error(f"An unexpected error occurred in log_meal_deviation_and_nudge: {e}")
            print("An unexpected error occurred while generating a nudge.")
            return None
        return None  # Explicitly return None if the response was empty

    def get_meal_suggestion(self) -> str:
        """
        Asks the AI to suggest a simple, healthy, and culturally appropriate meal idea.
        """
        prompt = f"""
You are an AI nutrition assistant for an Indian family.
Based on their health profiles, suggest ONE simple, healthy, and popular Indian meal idea (e.g., "Palak Paneer", "Vegetable Poha", "Dal Tadka").

Family Profiles:
{json.dumps(self.family_profiles, indent=2)}

Return ONLY the name of the meal as a single string. For example: "Masoor Dal with Roti".
"""
        try:
            response = self.client.models.generate_content(
                model="models/gemini-2.5-flash",
                contents=prompt,
                config=types.GenerateContentConfig(temperature=0.8)  # Higher temp for more variety
            )
            return response.text.strip().replace('"', '')
        except Exception as e:
            logger.error(f"Failed to get meal suggestion: {e}")
            return "Dal and Rice"  # A safe fallback

    def _analyze_meal_patterns(self, logs: List[MealLog]) -> Dict[str, Any]:
        """Analyze patterns from meal logs."""
        if not logs:
            return {"message": "No recent meal logs available"}

        patterns = {
            "total_meals_logged": len(logs),
            "meals_by_type": {},
            "skipped_meals": 0,
            "fast_food_frequency": 0,
            "average_satisfaction": 0,
            "common_foods": []
        }

        satisfaction_sum = 0
        satisfaction_count = 0

        for log in logs:
            # Count meal types
            meal_type = log.meal_type
            patterns["meals_by_type"][meal_type] = patterns["meals_by_type"].get(meal_type, 0) + 1

            # Check for skipped meals
            if "skipped" in " ".join(log.foods).lower():
                patterns["skipped_meals"] += 1

            # Check for fast food
            foods_text = " ".join(log.foods).lower()
            if any(indicator in foods_text for indicator in ["burger", "pizza", "chips", "noodles"]):
                patterns["fast_food_frequency"] += 1

            # Track satisfaction
            if log.satisfaction_rating:
                satisfaction_sum += log.satisfaction_rating
                satisfaction_count += 1

        if satisfaction_count > 0:
            patterns["average_satisfaction"] = satisfaction_sum / satisfaction_count

        return patterns

    def _generate_ai_enhanced_report(self, meal_patterns: Dict[str, Any]) -> FamilyHealthReport:
        """Generate AI-enhanced report using meal patterns."""
        # Enhanced prompt that includes meal logging data
        json_schema = FamilyHealthReport.model_json_schema()

        enhanced_context = f"""
Recent Meal Logging Data:
- Total meals logged: {meal_patterns.get('total_meals_logged', 0)}
- Meals by type: {meal_patterns.get('meals_by_type', {})}
- Skipped meals: {meal_patterns.get('skipped_meals', 0)}
- Fast food frequency: {meal_patterns.get('fast_food_frequency', 0)}
- Average satisfaction: {meal_patterns.get('average_satisfaction', 0):.1f}

Family Health Conditions: {', '.join([cond for profile in self.family_profiles for cond in profile.get('health_conditions', [])])}
"""

        contents = (
            "You have access to recent meal logging data and family health profiles:\n"
            + enhanced_context + "\n\n"
            + "Generate a personalized family nutrition report that incorporates the actual meal logging patterns. "
            + "Focus on specific improvements based on logged meals rather than generic advice.\n\n"
            + "Schema: " + json.dumps(json_schema, indent=2) + "\n\n"
            + "Return ONLY the JSON object."
        )

        try:
            response = self.client.models.generate_content(
                model="models/gemini-2.5-flash",
                contents=contents,
                config=types.GenerateContentConfig(temperature=0.3)
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

                json_data = json.loads(cleaned_text)
                return FamilyHealthReport(**json_data)
        except Exception as e:
            logger.error(f"Failed to generate enhanced report: {e}")

        # Fallback report
        return FamilyHealthReport(
            health_snapshot="Enhanced report generation failed, showing basic analysis.",
            today_s_focus="Focus on consistent meal logging to get better personalized recommendations.",
            condition_specific_advice={},
            coordinated_plan=CoordinatedPlan(
                nutritional_targets=NutritionalTargets(
                    calories_target="Based on logged meals",
                    protein_target="Monitor through logging",
                    key_nutrients=["Track via meal logs"]
                ),
                meal_plan=DailyMealPlan(
                    breakfast=MealSuggestion(
                        meal_name="Logged Meal Analysis",
                        ingredients=["Based on your logs"],
                        nutritional_highlights="Personalized based on patterns",
                        prep_time="Varies",
                        calories="Track in logs"
                    ),
                    lunch=MealSuggestion(
                        meal_name="Pattern-Based Suggestion",
                        ingredients=["Based on your logs"],
                        nutritional_highlights="Improved from logged meals",
                        prep_time="Varies",
                        calories="Monitor intake"
                    ),
                    dinner=MealSuggestion(
                        meal_name="Enhanced Dinner Option",
                        ingredients=["Based on your logs"],
                        nutritional_highlights="Tailored to your patterns",
                        prep_time="Varies",
                        calories="Track consistently"
                    ),
                    snacks=["Log your snacks for better recommendations"]
                ),
                shopping_list=["Based on logged meal patterns"],
                prep_tips=["Continue logging meals for personalized insights"]
            )
        )

    def _save_meal_logs(self):
        """Save meal logs to file."""
        try:
            logs_data = [log.model_dump() for log in self.meal_logs]
            with open("family_meal_logs.json", "w", encoding="utf-8") as f:
                json.dump(logs_data, f, indent=2, ensure_ascii=False)
        except Exception as e:
            logger.error(f"Failed to save meal logs: {e}")

    def _save_nudges(self):
        """Save nudges to file."""
        try:
            nudges_data = [nudge.model_dump() for nudge in self.nudges]
            with open("family_nudges.json", "w", encoding="utf-8") as f:
                json.dump(nudges_data, f, indent=2, ensure_ascii=False)
        except Exception as e:
            logger.error(f"Failed to save nudges: {e}")


def display_coordinated_plan(plan: CoordinatedMeal):
    """Formats and prints the coordinated meal plan."""
    print("-" * 40)
    print(f"Unified Prep: {', '.join(plan.unified_prep_steps)}")
    print(f"Base Ingredients: {', '.join(plan.base_ingredients)}")
    print("-" * 40)
    for mod in plan.modifications:
        print(f"👤 For {mod.member_name} ({mod.reason}):")
        print(f"   - Modification: {mod.modification_details}")
        print(f"   - Portion: {mod.portion_size}")
    print("-" * 40)
    print(f"Serving Instructions: {plan.serving_instructions}")


def display_adaptive_nudge(nudge: NutritionNudge):
    """Formats and prints the adaptive nudge."""
    print("-" * 40)
    print(f"💡 Nudge: {nudge.message}")
    print(f" actionable suggestion: {nudge.suggestions[0]}")
    print("-" * 40)

def _create_fallback_report():
    """Create a fallback report when AI generation fails."""
    return FamilyHealthReport(
        health_snapshot="Family nutrition analysis completed with general recommendations.",
        today_s_focus="Focus on balanced meals with adequate protein, vegetables, and whole grains.",
        condition_specific_advice={
            "General": "Maintain regular meal times and include a variety of colorful vegetables.",
            "Anemia": "Include iron-rich foods like spinach, lentils, and citrus fruits.",
            "Hypertension": "Reduce salt intake and include potassium-rich foods like bananas.",
            "Pre-diabetic": "Choose complex carbohydrates and monitor portion sizes."
        },
        coordinated_plan=CoordinatedPlan(
            nutritional_targets=NutritionalTargets(
                calories_target="1800-2200 calories per day based on family activity levels",
                protein_target="45-60g per day from varied sources",
                key_nutrients=["Iron", "Vitamin C", "Calcium", "Fiber", "Omega-3"]
            ),
            meal_plan=DailyMealPlan(
                breakfast=MealSuggestion(
                    meal_name="Vegetable Poha or Oatmeal",
                    ingredients=["Vegetables", "Oats or flattened rice", "Spices", "Nuts"],
                    nutritional_highlights="Provides sustained energy and essential nutrients",
                    prep_time="15-20 minutes",
                    calories="300-400"
                ),
                lunch=MealSuggestion(
                    meal_name="Dal, Rice, and Vegetable Sabzi",
                    ingredients=["Lentils", "Rice", "Mixed vegetables", "Whole wheat chapati"],
                    nutritional_highlights="Balanced meal with protein, carbs, and micronutrients",
                    prep_time="30-40 minutes",
                    calories="500-600"
                ),
                dinner=MealSuggestion(
                    meal_name="Roti with Paneer or Chicken Curry",
                    ingredients=["Whole wheat flour", "Paneer or chicken", "Vegetables", "Yogurt"],
                    nutritional_highlights="Complete protein with vegetables for satiety",
                    prep_time="25-35 minutes",
                    calories="450-550"
                ),
                snacks=["Fresh fruits", "Nuts", "Roasted chana", "Buttermilk", "Vegetable sticks"]
            ),
            shopping_list=[
                "Seasonal vegetables (spinach, tomatoes, onions)",
                "Lentils and legumes",
                "Whole grains (rice, wheat flour)",
                "Fruits (bananas, citrus)",
                "Nuts and seeds",
                "Spices and basic cooking oils"
            ],
            prep_tips=[
                "Prep vegetables in advance for quick meals",
                "Cook dal in batches for multiple meals",
                "Keep cut fruits available for healthy snacking",
                "Use local seasonal produce when available"
            ]
        )
    )

def main():
    """Main function to generate family nutrition report."""
    # Original execution logic moved here
    # ... existing code ...

load_dotenv()

key = os.getenv("GOOGLE_API_KEY")
if not key:
    raise ValueError("Google API Key not found. Please set it in a .env file.")

client = genai.Client(api_key=key)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Load family profiles from JSON
family_profiles = []
try:
    with open(os.path.join(os.path.dirname(__file__), "family_data.json"), "r", encoding="utf-8") as f:
        family_profiles = json.load(f)
except Exception as e:
    logger.error("Could not load family_data.json: %s", e)
    # Fallback to hardcoded if file not found
    family_profiles = [
        {
            "name": "Priya", "role": "Student", "BMI": 18.5, "gender": "Female",
            "health_conditions": ["Vitamin D deficiency", "Anemia"],
            "health_goals": ["Healthier lifestyle", "Nutritious meals"],
            "access_to_kitchen": "rarely", "stress_level": "high", "meal_source": "fast_food"
        },
        {
            "name": "Rajesh", "role": "Father", "BMI": 26, "gender": "Male",
            "health_conditions": ["Hypertension"],
            "health_goals": ["Reduce blood pressure", "Lose weight"],
            "access_to_kitchen": "always", "stress_level": "moderate", "meal_source": "home_cooked"
        },
        {
            "name": "Sunita", "role": "Mother (Primary Cook)", "BMI": 28, "gender": "Female",
            "health_conditions": ["Pre-diabetic"],
            "health_goals": ["Manage blood sugar", "Lose weight"],
            "access_to_kitchen": "always", "stress_level": "moderate", "meal_source": "home_cooked"
        }
    ]

environmentContext = {
    "location": "Jaipur",
    "availability": [
        "tea", "poha", "upma", "dal", "rice", "chapati_flour", "seasonal_vegetables", "curd",
        "banana", "roasted_chana", "buttermilk", "cooking_oil", "basic_spices", "community_meals",
        "local_market", "senior_living_community_kitchen", "digital_literacy_workshop"
    ],
    "season": "Autumn",
    "cultural_event": "local_fairs_and_meets"
}

priya_meal_log = {
    "breakfast": "Skipped or instant noodles",
    "lunch": "Fast food burger or budget thali",
    "snacks": "Chips, cold drinks, samosa",
    "dinner": "Maggi noodles or food court meal"
}

# Check if meal log has meaningful data, provide fallback if empty
meal_log_has_data = any(value and value not in ["", "N/A", "None", "null"] for value in priya_meal_log.values())
if not meal_log_has_data:
    priya_meal_log = {
        "breakfast": "Not specified - will provide general healthy recommendations",
        "lunch": "Not specified - will provide general healthy recommendations",
        "snacks": "Not specified - will provide general healthy recommendations",
        "dinner": "Not specified - will provide general healthy recommendations"
    }

# Load local food data for context
food_data = []
try:
    with open(os.path.join(os.path.dirname(__file__), "food_data.json"), "r", encoding="utf-8") as f:
        food_data = json.load(f)
    logger.info("Loaded food_data.json with %d posts", len(food_data))
except Exception as e:
    logger.warning("Could not load food_data.json: %s", e)

# Load posts data for additional context
posts_data = []
try:
    with open(os.path.join(os.path.dirname(__file__), "posts_data.json"), "r", encoding="utf-8") as f:
        posts_data = json.load(f)
    logger.info("Loaded posts_data.json with %d posts", len(posts_data))
except Exception as e:
    logger.warning("Could not load posts_data.json: %s", e)

# Load digi_data.json for additional context
digi_data = []
try:
    with open(os.path.join(os.path.dirname(__file__), "digi_data.json"), "r", encoding="utf-8") as f:
        digi_data = json.load(f)
    logger.info("Loaded digi_data.json with %d entries", len(digi_data))
except Exception as e:
    logger.warning("Could not load digi_data.json: %s", e)

# Load insights.json if present
previous_insights = {}
try:
    with open(os.path.join(os.path.dirname(__file__), "insights.json"), "r", encoding="utf-8") as f:
        previous_insights = json.load(f)
    logger.info("Loaded insights.json with %d entries", len(previous_insights))
except Exception as e:
    logger.info("No previous insights.json found or could not load it")
    pass

# Build context from food_data and posts_data similar to nudging.py
meal_foods = set()
for meal in priya_meal_log.values():
    if isinstance(meal, str):
        meal_foods.update(meal.lower().split())

user_terms = set()
for profile in family_profiles:
    for key in ["health_conditions", "health_goals"]:
        for item in profile.get(key, []):
            user_terms.add(item.lower())

# Combine food_data and posts_data for comprehensive matching
all_posts = food_data + posts_data

matches = []
for post in all_posts:
    keywords = set([k.lower() for k in post.get("search_keywords", []) if isinstance(k, str)])
    tags = set([t.lower() for t in post.get("tags", []) if isinstance(t, str)])
    queries = set([q.lower() for q in post.get("queries", []) if isinstance(q, str)])
    title = (post.get("post_title") or post.get("title") or "").lower()
    description = (post.get("post_description") or post.get("text") or "").lower()

    # Combine all searchable terms
    all_search_terms = keywords | tags | queries

    matched_terms = set()
    match_sources = []

    # Direct overlaps with meal foods and user terms
    if meal_foods & all_search_terms:
        overlap = meal_foods & all_search_terms
        matched_terms.update(overlap)
        match_sources.append("meal_foods")

    if user_terms & all_search_terms:
        overlap = user_terms & all_search_terms
        matched_terms.update(overlap)
        match_sources.append("user_profile_terms")

    # Presence in title/description
    for term in (meal_foods | user_terms):
        if term in title or term in description:
            matched_terms.add(term)
            match_sources.append("title/description")

    # Also check comments for additional context
    comments = post.get("comments", [])
    if isinstance(comments, list):
        for comment in comments:
            if isinstance(comment, str):
                comment_lower = comment.lower()
                for term in (meal_foods | user_terms):
                    if term in comment_lower:
                        matched_terms.add(term)
                        match_sources.append("comments")

    if matched_terms:
        relevant_recs = []
        recommendations = post.get("recommendations", [])
        if isinstance(recommendations, list):
            for rec in recommendations:
                r_text = (rec.get("text") or "").lower()
                if any(term in r_text for term in matched_terms):
                    relevant_recs.append(rec)
        elif isinstance(post.get("comments"), list):  # For posts_data format
            # Use comments as recommendations for posts_data
            for comment in post.get("comments", []):
                if isinstance(comment, str):
                    comment_lower = comment.lower()
                    if any(term in comment_lower for term in matched_terms):
                        relevant_recs.append({"text": comment, "type": "comment"})

        matches.append({
            "id": post.get("id") or post.get("title", "unknown"),
            "title": post.get("post_title") or post.get("title", ""),
            "matched_terms": list(matched_terms),
            "match_sources": list(set(match_sources)),
            "relevant_recommendations": relevant_recs[:5]  # Limit to 5
        })

context_summary = []
for m in matches[:8]:  # Increased from 5 to 8 for more context
    recs = m.get('relevant_recommendations', [])
    if recs:
        hint = (recs[0].get('text') or '')[:150].replace('\n', ' ')
        context_summary.append(f"{m.get('id')}: {m.get('title')} -> {hint}")
    else:
        context_summary.append(f"{m.get('id')}: {m.get('title')}")

# Add digi_data snippets
for item in digi_data[:5]:  # Increased from 3 to 5
    title = item.get("title", "")
    text = item.get("text", "")[:120]  # Increased from 100
    tags = item.get("tags", [])
    if isinstance(tags, list):
        tag_str = ", ".join(tags[:3])
        context_summary.append(f"DIGI: {title} -> {text} [Tags: {tag_str}]")
    else:
        context_summary.append(f"DIGI: {title} -> {text}")

# Add previous insights
if previous_insights:
    for k, v in list(previous_insights.items())[:5]:  # Increased from 3 to 5
        if isinstance(v, str):
            context_summary.append(f"INSIGHT: {k} -> {v[:120]}")

combined_context_str = "\n".join(context_summary)

# Log what we found
logger.info("Number of context posts used: %d", len(context_summary))
logger.info("Total matches found: %d", len(matches))
if matches:
    logger.info("Top matched terms: %s", ", ".join(list(set([term for m in matches[:3] for term in m.get("matched_terms", [])]))[:10]))

# System instruction
system_instruction = (
    "You are an expert AI nutritionist specializing in family health management. "
    "Analyze the provided family profiles, meal patterns, and environmental context to create personalized nutrition recommendations. "
    "Consider each family member's health conditions, goals, access to kitchen facilities, and stress levels. "
    "Take into account local food availability, seasonal factors, and cultural preferences. "
    "If meal data is limited or missing, provide general healthy recommendations based on the family profiles. "
    "Focus on practical, achievable changes that support the family's health goals. "
    "Do NOT provide medical diagnoses - only nutritional and lifestyle suggestions."
)

# Prompt
json_schema = FamilyHealthReport.model_json_schema()
contents = (
    "You are an expert AI nutritionist. Based on the family profiles and meal patterns provided, "
    "generate a personalized nutrition report.\n\n"
    "FAMILY PROFILES:\n" + json.dumps(family_profiles, indent=2) + "\n\n"
    "MEAL PATTERNS:\n" + json.dumps(priya_meal_log, indent=2) + "\n\n"
    "ENVIRONMENT CONTEXT:\n" + json.dumps(environmentContext, indent=2) + "\n\n"
    "ADDITIONAL CONTEXT:\n" + combined_context_str + "\n\n"
    "Generate a JSON object with the following structure (provide actual content, not the schema):\n"
    "{\n"
    '  "health_snapshot": "A brief overview of the family\'s current health status",\n'
    '  "today_s_focus": "The most important nutritional goal for today",\n'
    '  "condition_specific_advice": {\n'
    '    "condition_name": "specific nutritional advice for this condition"\n'
    '  },\n'
    '  "coordinated_plan": {\n'
    '    "nutritional_targets": {\n'
    '      "calories_target": "recommended daily calorie range",\n'
    '      "protein_target": "recommended protein intake",\n'
    '      "key_nutrients": ["nutrient1", "nutrient2"]\n'
    '    },\n'
    '    "meal_plan": {\n'
    '      "breakfast": {\n'
    '        "meal_name": "suggested breakfast",\n'
    '        "ingredients": ["ingredient1", "ingredient2"],\n'
    '        "nutritional_highlights": "key nutritional benefits",\n'
    '        "prep_time": "preparation time",\n'
    '        "calories": "approximate calories"\n'
    '      },\n'
    '      "lunch": { ... similar structure ... },\n'
    '      "dinner": { ... similar structure ... },\n'
    '      "snacks": ["snack1", "snack2"]\n'
    '    },\n'
    '    "shopping_list": ["item1", "item2"],\n'
    '    "prep_tips": ["tip1", "tip2"]\n'
    '  }\n'
    "}\n\n"
    "Return ONLY the JSON object with actual content filled in. No explanations, no schema definitions, just the JSON data."
)

# Generate response
try:
    response = client.models.generate_content(
        model="models/gemini-2.5-flash",
        contents=contents,
        config=types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.3,  # Lower temperature for more consistent JSON output
            response_mime_type="application/json"  # Force JSON response
        )
    )
except Exception as e:
    logger.error(f"API call failed: {e}")
    # Create a fallback response
    response = type('Response', (), {'text': None})()

# Debug: Print the raw response to inspect it
if response.text:
    print("Raw response text:", repr(response.text))
    print("Response length:", len(response.text) if response.text else 0)
else:
    print("No response text received")

# Check if response is valid
if not response.text or response.text.strip() == "":
    logger.error("Empty response from API")
    report = FamilyHealthReport(
        health_snapshot="API quota exceeded. Please try again later.",
        today_s_focus="Focus on balanced meals with local ingredients.",
        condition_specific_advice={
            "General": "Maintain regular meal times and include vegetables in every meal."
        },
        coordinated_plan=CoordinatedPlan(
            nutritional_targets=NutritionalTargets(
                calories_target="1800-2200 kcal",
                protein_target="60-80g",
                key_nutrients=["Vitamin C", "Fiber", "Iron"]
            ),
            meal_plan=DailyMealPlan(
                breakfast=MealSuggestion(
                    meal_name="Vegetable Poha",
                    ingredients=["Rice flakes", "Vegetables", "Spices"],
                    nutritional_highlights="Good source of carbohydrates and vitamins",
                    prep_time="15 minutes",
                    calories="250-300"
                ),
                lunch=MealSuggestion(
                    meal_name="Dal and Rice",
                    ingredients=["Lentils", "Rice", "Vegetables"],
                    nutritional_highlights="High in protein and fiber",
                    prep_time="30 minutes",
                    calories="400-500"
                ),
                dinner=MealSuggestion(
                    meal_name="Vegetable Curry with Roti",
                    ingredients=["Mixed vegetables", "Whole wheat flour", "Spices"],
                    nutritional_highlights="Balanced meal with essential nutrients",
                    prep_time="45 minutes",
                    calories="350-450"
                ),
                snacks=["Fruits", "Nuts", "Yogurt"]
            ),
            shopping_list=["Rice", "Lentils", "Vegetables", "Spices", "Fruits"],
            prep_tips=["Prepare vegetables in advance", "Cook in batches", "Use seasonal ingredients"]
        )
    )
else:
    # Attempt to parse and validate JSON using Pydantic
    try:
        # Clean the response text - remove markdown code blocks if present
        cleaned_text = response.text.strip()
        if cleaned_text.startswith("```json"):
            cleaned_text = cleaned_text[7:]
        if cleaned_text.startswith("```"):
            cleaned_text = cleaned_text[3:]
        if cleaned_text.endswith("```"):
            cleaned_text = cleaned_text[:-3]
        cleaned_text = cleaned_text.strip()

        print("Cleaned response text:", repr(cleaned_text))

        # Try to parse as JSON
        json_data = json.loads(cleaned_text)

        # Check if we got the schema instead of actual data
        if "$schema" in json_data or ("type" in json_data and json_data.get("type") == "object"):
            logger.warning("AI returned schema instead of data, using fallback")
            raise ValueError("Schema returned instead of data")

        report = FamilyHealthReport(**json_data)
        logger.info("Successfully parsed and validated JSON response using Pydantic")

    except (json.JSONDecodeError, ValueError) as e:
        logger.error("Failed to parse JSON response: %s", e)
        logger.error("Cleaned response text: %s", cleaned_text)

        # Try to extract JSON from the text if it's embedded
        import re
        json_match = re.search(r'\{.*\}', cleaned_text, re.DOTALL)
        if json_match:
            try:
                json_data = json.loads(json_match.group())
                if "$schema" not in json_data and json_data.get("type") != "object":
                    report = FamilyHealthReport(**json_data)
                    logger.info("Successfully extracted and parsed JSON from response")
                else:
                    raise ValueError("Extracted JSON is still a schema")
            except Exception as e2:
                logger.error("Failed to parse extracted JSON: %s", e2)
                report = _create_fallback_report()
        else:
            report = _create_fallback_report()
    except Exception as e:
        logger.error("Failed to validate response with Pydantic: %s", e)
        logger.error("Response text: %s", response.text)
        # Fallback: Provide a default report
        report = _create_fallback_report()

# Save report to JSON file
try:
    report_dict = report.model_dump()
    with open("family_nutrition_report.json", "w", encoding="utf-8") as f:
        json.dump(report_dict, f, indent=2, ensure_ascii=False)
    logger.info("Report saved to family_nutrition_report.json")
except Exception as e:
    logger.error("Failed to save report to JSON: %s", e)

# Simulated app output
print("\n" + "="*60)
print("           🍲 Your Family's Nutrition Plan 🍲            ")
print("="*60 + "\n")

print("📊 Health Snapshot")
print("-" * 40)
print(f"{report.health_snapshot}\n")

print("🎯 Today's Nutritional Focus")
print("-" * 40)
print(f"{report.today_s_focus}\n")

print("🏥 Condition-Specific Advice")
print("-" * 40)
for condition, advice in report.condition_specific_advice.items():
    print(f"• {condition}: {advice}")
print()

print("📈 Daily Nutritional Targets")
print("-" * 40)
targets = report.coordinated_plan.nutritional_targets
print(f"• Calories: {targets.calories_target}")
print(f"• Protein: {targets.protein_target}")
print("• Key Nutrients:")
for nutrient in targets.key_nutrients:
    print(f"  - {nutrient}")
print()

print("🍽️  Today's Meal Plan")
print("-" * 40)

meal_plan = report.coordinated_plan.meal_plan

print("🌅 BREAKFAST:")
print(f"• {meal_plan.breakfast.meal_name}")
print(f"  Ingredients: {', '.join(meal_plan.breakfast.ingredients)}")
print(f"  Nutrition: {meal_plan.breakfast.nutritional_highlights}")
print(f"  Prep Time: {meal_plan.breakfast.prep_time} | Calories: {meal_plan.breakfast.calories}")
print()

print("🌞 LUNCH:")
print(f"• {meal_plan.lunch.meal_name}")
print(f"  Ingredients: {', '.join(meal_plan.lunch.ingredients)}")
print(f"  Nutrition: {meal_plan.lunch.nutritional_highlights}")
print(f"  Prep Time: {meal_plan.lunch.prep_time} | Calories: {meal_plan.lunch.calories}")
print()

print("🌙 DINNER:")
print(f"• {meal_plan.dinner.meal_name}")
print(f"  Ingredients: {', '.join(meal_plan.dinner.ingredients)}")
print(f"  Nutrition: {meal_plan.dinner.nutritional_highlights}")
print(f"  Prep Time: {meal_plan.dinner.prep_time} | Calories: {meal_plan.dinner.calories}")
print()

print("🍿 Healthy Snacks:")
for snack in meal_plan.snacks:
    print(f"• {snack}")
print()

print("🛒 Shopping List")
print("-" * 40)
for item in report.coordinated_plan.shopping_list:
    print(f"• {item}")
print()

print("💡 Preparation Tips")
print("-" * 40)
for tip in report.coordinated_plan.prep_tips:
    print(f"• {tip}")

print("\n" + "="*60)

# Demo function for meal logging functionality
def main():
    """
    Demonstrates the complete 'Adaptive Meal Scaffolding' workflow.
    """
    print("\n" + "="*60)
    print("      🍲 Welcome to the Adaptive Family Nutrition Agent 🍲      ")
    print("="*60 + "\n")

    tracker = FamilyNutritionTracker()

    # --- Step 1: The Morning Huddle (Proactive Planning) ---
    print("--- [Morning] User decides what to cook ---")
    
    # Simulate user choice: they can input an idea or ask for one.
    user_has_idea = False  # Set to True/False to test both paths
    
    if user_has_idea:
        meal_idea = "Rajma Chawal"
        print(f"User's Idea: 'I want to cook {meal_idea} for dinner.'")
    else:
        print("User asks: 'What should I cook today?'")
        meal_idea = tracker.get_meal_suggestion()
        print(f"AI Suggestion: 'How about making {meal_idea} today?'")
    
    daily_plan = tracker.create_daily_plan(meal_idea)

    if not daily_plan:
        print("\nCould not generate a daily plan. Exiting demo.")
        return

    print(f"\n✅ AI has generated a coordinated plan for '{daily_plan.main_meal_plan.meal_name}':")
    display_coordinated_plan(daily_plan.main_meal_plan)

    print("\n--- [Afternoon] A deviation from the plan occurs ---")
    member_deviated = "Priya"
    deviation = "Had a samosa and chai with colleagues."
    print(f"User logs deviation: '{member_deviated} {deviation}'")
    
    adaptive_nudge = tracker.log_meal_deviation_and_nudge(
        member_name=member_deviated, 
        deviation_description=deviation
    )

    if adaptive_nudge:
        print("\n✅ AI has generated a supportive, course-correcting nudge:")
        display_adaptive_nudge(adaptive_nudge)
    else:
        print("\nNo nudge was generated for this deviation.")

    print("\n" + "="*60)
    print("                   Demo Complete                   ")
    print("="*60 + "\n")

if __name__ == "__main__":
    # Run the adaptive meal scaffolding demo
    main()