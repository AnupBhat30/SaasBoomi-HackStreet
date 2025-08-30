import os
import json
import logging
import re
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=key)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

# Global variables
mongoReasoning = []
context_summary = []
substitutions_from_posts = []
mongo_swaps_preview = []
meal_items_list = []
combined_context_str = ""

class UserInfoModel(BaseModel):
    userInfo: dict

class EnvironmentContextModel(BaseModel):
    environmentContext: dict

class MealLogModel(BaseModel):
    mealLog: dict

USER_DATA_FILE = os.path.join(os.path.dirname(__file__), "user_data.json")
ENVIRONMENT_CONTEXT_FILE = os.path.join(os.path.dirname(__file__), "environment_context.json")
MEAL_LOG_FILE = os.path.join(os.path.dirname(__file__), "meal_log.json")

def load_user_info():
    if os.path.exists(USER_DATA_FILE):
        try:
            with open(USER_DATA_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                if data:  # Check if not empty
                    return data
                else:
                    logger.warning("user_data.json is empty. Using fallback.")
        except Exception as e:
            logger.warning(f"Failed to load user_data.json: {e}. Using fallback.")
    return {
        "name": "Mr. Sharma",
        "location": "Jaipur",
        "age": 68,
        "BMI": 26,
        "gender": "Male",
        "health_conditions": ["hypertension", "arthritis", "social_isolation"],
        "allergies": [],
        "health_goals": ["reduce loneliness", "maintain mobility", "manage blood pressure", "improve digital literacy"],
        "medication_details": [],
        "budget_for_food": 1000,
        "occupation_type": "retired",
        "work_schedule": "none",
        "access_to_kitchen": "shared_community_kitchen",
        "stress_level": "moderate",
        "meal_source": "home_cooked",
    }

def load_environment_context():
    if os.path.exists(ENVIRONMENT_CONTEXT_FILE):
        try:
            with open(ENVIRONMENT_CONTEXT_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.warning(f"Failed to load environment_context.json: {e}. Using fallback.")
    return {
        "availability": [],
        "season": "Autumn",
    }

def load_meal_log():
    if os.path.exists(MEAL_LOG_FILE):
        try:
            with open(MEAL_LOG_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.warning(f"Failed to load meal_log.json: {e}. Using fallback.")
    return {
        "breakfast": {"foods": []},
        "lunch": {"foods": []},
        "snacks": {"foods": []},
        "dinner": {"foods": []}
    }

def load_mongo_reasoning():
    return mongoReasoning

def load_context_summary():
    return context_summary

def load_substitutions_from_posts():
    return substitutions_from_posts

def load_mongo_swaps_preview():
    return mongo_swaps_preview

def load_meal_items_list():
    return meal_items_list

def load_combined_context_str():
    return combined_context_str

def generate_tags(recipe_name):
    """Generate an array of tags from the recipe name for unique identification."""
    if not recipe_name:
        return []
    # Clean the recipe name: remove punctuation, convert to lower case
    cleaned = re.sub(r'[^\w\s]', '', recipe_name.lower())
    # Split into words
    words = cleaned.split()
    # Include individual words and the full name
    tags = words + [cleaned.strip()]
    # Remove duplicates and empty strings
    tags = list(set(tag for tag in tags if tag))
    return tags

# --- user info and meal log to be embedded into the system instruction ---
userInfo = load_user_info()

environmentContext = load_environment_context()

mealLog = load_meal_log()


# Load local food data for context
food_data = []
try:
    with open(os.path.join(os.path.dirname(__file__), "food_data.json"), "r", encoding="utf-8") as f:
        food_data = json.load(f)
except Exception as e:
    # could not load food_data.json; continue silently
    pass

# Load digi_data.json for additional user/context signals (optional)
digi_data = {}
try:
    digi_path = os.path.join(os.path.dirname(__file__), "digi_data.json")
    if not os.path.exists(digi_path):
        # fallback to current working directory in case script is run differently
        digi_path = os.path.join(os.getcwd(), "digi_data.json")
    with open(digi_path, "r", encoding="utf-8") as f:
        digi_data = json.load(f)
    # log that digi_data was read successfully (user requested this log)
    try:
        # show a compact preview of top-level keys or length
        if isinstance(digi_data, dict):
            logger.info("Loaded digi_data.json with keys: %s", list(digi_data.keys())[:6])
        elif isinstance(digi_data, list):
            logger.info("Loaded digi_data.json as list with %d entries", len(digi_data))
        else:
            logger.info("Loaded digi_data.json (type=%s)", type(digi_data).__name__)
    except Exception:
        logger.info("Loaded digi_data.json")
except Exception:
    digi_data = {}

# Load any previously produced insights to incorporate as context (optional)
previous_insights = None
insights_path = os.path.join(os.path.dirname(__file__), "insights.json")
try:
    if os.path.exists(insights_path):
        with open(insights_path, "r", encoding="utf-8") as f:
            previous_insights = json.load(f)
        # previous_insights loaded if present
    else:
        # no previous insights file present
        pass
except Exception as e:
    # ignore failures to load previous insights for this run
    pass

meal_foods = set()
for m in mealLog.values():
    # Handle new format: direct array of food names
    if isinstance(m, list):
        for food in m:
            if isinstance(food, str):
                meal_foods.add(food.lower())
    # Handle old format: {"foods": [...]}
    elif isinstance(m, dict) and "foods" in m:
        for food in m.get("foods", []):
            if isinstance(food, str):
                meal_foods.add(food.lower())
            elif isinstance(food, dict) and "name" in food:
                meal_foods.add(food["name"].lower())

# Build user-related search terms from profile: goals, conditions, meds, allergies
user_terms = set()
for key_name in ("health_goals", "health_conditions", "medication_details", "allergies"):
    for t in userInfo.get(key_name, []) or []:
        if isinstance(t, str):
            user_terms.add(t.lower())

# Include BMI as a token if present (turn number into a rough tag)
try:
    bmi_val = int(userInfo.get("BMI", 0))
    user_terms.add(str(bmi_val))
except Exception:
    pass

# Candidate selection and deeper analysis: look for posts where
# - post keywords or foods intersect with meal_foods OR user_terms
# - or title/description contain meal_foods or user_terms
matches = []
for post in food_data:
    keywords = set([k.lower() for k in post.get("search_keywords", []) if isinstance(k, str)])
    foods = set([f.lower() for f in post.get("foods", []) if isinstance(f, str)])
    title = (post.get("post_title") or "")
    description = (post.get("post_description") or post.get("description") or "")
    title_l = title.lower()
    desc_l = description.lower()

    matched_terms = set()
    match_sources = []

    # direct overlaps with meal foods, keywords, and user terms
    if meal_foods & (keywords | foods):
        overlap = meal_foods & (keywords | foods)
        matched_terms.update(overlap)
        match_sources.append("meal_foods")

    if user_terms & (keywords | foods):
        overlap = user_terms & (keywords | foods)
        matched_terms.update(overlap)
        match_sources.append("user_profile_terms")

    # presence in title/description
    for term in (meal_foods | user_terms):
        if term in title_l or term in desc_l:
            matched_terms.add(term)
            match_sources.append("title/description")

    # If nothing matched by the above but keywords exist that look promising, skip
    if not matched_terms:
        continue

    # Analyze recommendations and keep only relevant ones
    relevant_recs = []
    for rec in post.get("recommendations", []) or []:
        r_text = (rec.get("text") or "").lower()
        r_type = (rec.get("type") or "").lower()
        reasons = []
        if meal_foods & set(r_text.split()):
            reasons.append("matches_meal_food_in_text")
        if user_terms & set(r_text.split()):
            reasons.append("matches_user_term_in_text")
        if user_terms & set(r_type.split()):
            reasons.append("matches_user_term_in_type")
        # also match if recommendation mentions any of the matched_terms or keywords
        if any(t in r_text for t in matched_terms) or any(t in r_type for t in matched_terms) or any(t in r_text for t in keywords):
            reasons.append("contains_matched_term")

        # keep recommendation if we found at least one reason
        if reasons:
            relevant_recs.append({
                "type": rec.get("type"),
                "text": rec.get("text"),
                "reasons": list(set(reasons))
            })

    matches.append({
        "id": post.get("id"),
        "title": title,
        "matched_terms": sorted(matched_terms),
        "match_sources": sorted(set(match_sources)),
        "title_snippet": title[:160],
        "description_snippet": description[:240],
        "relevant_recommendations": relevant_recs,
        "all_recommendations_count": len(post.get("recommendations", []) or [])
    })

# (Detailed match logs removed) - summary count will be printed after context is built

# Build a compact context summary from matches (keep it short, focusing on the kept recommendations)
context_summary = []
for m in matches[:6]:
    recs = m.get('relevant_recommendations', [])
    if recs:
        # include the first relevant recommendation text as a short hint
        hint = (recs[0].get('text') or '')[:120].replace('\n', ' ')
        context_summary.append(f"{m.get('id')}: {m.get('title')} -> rec: {hint}")
    else:
        context_summary.append(f"{m.get('id')}: {m.get('title')} (no directly relevant recs)")

# Log only the number of posts used as context
logger.info("Number of context posts used: %d", len(context_summary))

# Extract substitution/swap-type recommendations from the matched posts (prioritize these)
substitutions_from_posts = []
for m in matches:
    pid = m.get('id')
    for rec in (m.get('relevant_recommendations') or []):
        rtext = (rec.get('text') or '')
        rtype = (rec.get('type') or '')
        rt = rtext.lower()
        rt_type = rtype.lower()
        # heuristics: type contains swap/substitute/replace OR text mentions swap/replace/substitute/instead
        if any(k in rt_type for k in ('swap', 'substitute', 'replacement')) or any(k in rt for k in ('swap', 'replace', 'substitute', 'instead of', 'instead')):
            substitutions_from_posts.append({
                'post_id': pid,
                'text': rtext.strip(),
                'type': rtype
            })

if substitutions_from_posts:
    # include up to 6 of these in the compact context so the model uses them directly
    for s in substitutions_from_posts[:6]:
        context_summary.append(f"POST_SWAP: {s['post_id']} -> {s['text']}")
else:
    # no substitution snippets to add
    pass

# Log what meal foods and user terms we used
# (suppress detailed logs; only the context post count is logged)

# Append short snippets from digi_data and previous_insights into the compact context so the model can reference them
if digi_data:
    try:
        # Keep it short: include up to 4 top-level keys and a tiny JSON snippet
        keys = list(digi_data.keys())[:4]
        context_summary.append("DIGI_DATA_KEYS: " + ", ".join(keys))
        # include a small sample of one key if available
        sample_key = keys[0] if keys else None
        if sample_key:
            sample_val = str(digi_data.get(sample_key))[:200].replace('\n', ' ')
            context_summary.append(f"DIGI_SAMPLE: {sample_key} -> {sample_val}")
    except Exception:
        pass

if previous_insights:
    try:
        # If insights is a dict with some keys, include a brief summary line for each main field
        if isinstance(previous_insights, dict):
            preview = []
            for k, v in previous_insights.items():
                if isinstance(v, str):
                    preview.append(f"{k}: {v[:80].replace('\n',' ')}")
                elif isinstance(v, list):
                    preview.append(f"{k}: list(len={len(v)})")
                else:
                    preview.append(f"{k}: {type(v).__name__}")
            # include up to 3 preview lines
            for p in preview[:3]:
                context_summary.append("PREV_INSIGHT: " + p)
    except Exception:
        pass

# Build safe previews for inclusion in the system instruction payload
if isinstance(digi_data, dict):
    digi_preview = {k: (str(digi_data.get(k))[:180]) for k in list(digi_data.keys())[:3]}
elif digi_data:
    # digi_data is present but not a dict (e.g., a list) - include a short string preview
    digi_preview = {"_preview": str(digi_data)[:180]}
else:
    digi_preview = {}

if isinstance(previous_insights, dict):
    prev_preview = {k: (str(previous_insights.get(k))[:180]) for k in list(previous_insights.keys())[:3]}
else:
    prev_preview = {}

# Build a combined context preview that weights food_data posts 60% and digi_data 40% (by prominence)
combined_context_lines = []
# Prefer up to 6 food_data context lines (60%)
for i, line in enumerate(context_summary[:6]):
    combined_context_lines.append(f"FD[{i+1}]: {line}")

# Add up to 4 snippets from digi_data (40%) to the combined context
if digi_data:
    try:
        if isinstance(digi_data, dict):
            # include up to 4 key->shortvalue pairs
            keys = list(digi_data.keys())[:4]
            for k in keys:
                v = str(digi_data.get(k))[:140].replace('\n', ' ')
                combined_context_lines.append(f"DD:{k} -> {v}")
        elif isinstance(digi_data, list):
            for idx, item in enumerate(digi_data[:4]):
                combined_context_lines.append(f"DD_ITEM[{idx+1}]: {str(item)[:140].replace('\n',' ')}")
        else:
            combined_context_lines.append(f"DD_PREVIEW: {str(digi_data)[:180].replace('\n',' ')}")
    except Exception:
        # fallback small preview
        combined_context_lines.append("DD_PREVIEW: (could not extract detailed preview)")

# Add an explicit weighting note so the LLM understands the priority
combined_context_str = "CONTEXT_WEIGHTING: food_data=60,digi_data=40\n" + "\n".join(combined_context_lines)

system_instruction = (
    "You are a clinical-aware nutrition assistant. "
    "Use the provided userInfo and mealLog to analyze dietary choices and give concise, practical guidance. "
    "UserInfo, MealLog, and environmentContext are JSON objects included below. Consider availability, and season when suggesting foods or swaps (use this flexibly). Be mindful of health conditions and goals. "
    "Do NOT give medical diagnoses; give food and behavior suggestions consistent with the user's goals and conditions.\n\n"
    "USER_INFO: " + json.dumps(userInfo) + "\n"
    "MEAL_LOG: " + json.dumps(mealLog) + "\n"
    "ENVIRONMENT_CONTEXT: " + json.dumps(environmentContext) + "\n"
)

# Compose the prompt contents: include short food_data matches + digi_data + previous insights as context
contents = (
    "You have access to relevant posts from the food database and digi_data for context (weighted):\n"
    + combined_context_str + "\n\n"
    + "\n".join(context_summary)
    + "\n\nAlso consider environmentContext (availability, season) when choosing recommendations; prefer suggestions that use available ingredients or are suitable for the user's location/season.\n\n"
    + "Using the system instruction (which includes userInfo, mealLog and environmentContext), produce a single JSON object (only JSON, no extra text) with the following keys:\n"
    "1) key_insight (string): a concise 4-5 line insight that explicitly references the user's profile (conditions, goals, BMI) and the meals the user actually ate today; describe how those meals are likely to affect the user's health (positive or negative impacts), and note any immediate concerns or helpful patterns observed.\n"
    "2) modern_approach (string): a 3-4 line suggestion using modern foods or methods to help the user's goals; use the recommendations and comments from the matched posts where applicable.\n"
    "3) heritage_alternative (string): a 3-4 line set of Indian/heritage alternatives (specific Indian foods or preparations) relevant to the user's goals, drawn from food_data.json recommendations where applicable.\n"
    "4) simple_swap (string): 2-3 lines suggesting simple Indian swap(s) for items in the mealLog the user can use tomorrow (use food_data.json recommendations if present).\n"
    "5) general_summary (array): a list of 4-5 short actionable strings the user should generally do for the next logging (next day), personalized using mealLog, userInfo, previous insights, digi_data.json context, and environmentContext. Each should be an encouraging, achievable step that uses the simple_swap, modern_approach, or heritage_alternative where relevant. Subtly reference environmentContext (availability/season) where helpful — e.g., 'for breakfast, start your day with X since it's available', or 'since it's Monsoon, prefer warm, hydrating options at lunch' — but do so briefly and not emphatically.\n\n"
    "When answering, heavily use the matched posts and the 'recommendations' fields from food_data.json, the digi_data.json content, and any previous insights in insights.json as context. If you cite specific suggested foods, ensure they are realistic Indian items.\n"
    "Return ONLY the JSON object. Keep each string reasonably short (approx 3-4 lines for string fields, 4-5 short strings for general_summary).\n\n"
    "SYSTEM_INSTRUCTION: " + json.dumps({"userInfo": userInfo, "mealLog": mealLog, "environmentContext": environmentContext, "digi_data_preview": digi_preview, "previous_insights": prev_preview}) + "\n\n"
)

    # (The LLM call has been moved below so it can use mongoReasoning as context.)


# --- MONGO DB ALTERNATIVES BLOCK (separate, added as requested) ---
try:
    from pymongo import MongoClient
    from bson.json_util import dumps as _dumps
except Exception:
    MongoClient = None


def _safe_get_env(varname: str):
    try:
        return os.getenv(varname)
    except Exception:
        return None


def _split_food_items(text: str):
    """Split a combined food string into probable separate items.
    Simple heuristics: split on ' or ', '/', ' and ' (case-insensitive). Preserve parenthetical notes.
    Returns a list of cleaned item strings.
    """
    if not isinstance(text, str):
        return [text]
    # Normalize common separators
    parts = re.split(r"\s+(?:or|and|/)\s+", text, flags=re.I)
    out = []
    for p in parts:
        p = p.strip()
        # remove stray leading/trailing commas/semicolons
        p = p.strip(',;')
        if p:
            out.append(p)
    return out


mongoReasoning = []

def _atlas_search_local(collection, query: str, limit: int = 3):
    if collection is None:
        return []
    pipeline = [
        {"$search": {"index": "default", "text": {"query": query, "path": "dish_name"}}},
        {"$limit": limit},
        {"$project": {"_id": 0}}
    ]
    try:
        results = list(collection.aggregate(pipeline))
        if results:
            return results
    except Exception:
        # Atlas Search may fail if index not configured; fallback to regex
        pass

    try:
        cursor = collection.find({"dish_name": {"$regex": query, "$options": "i"}}, {"_id": 0}).limit(limit)
        return list(cursor)
    except Exception:
        return []


def _find_similar_healthier_candidates(collection, substitutes_collection, base_dish: dict, conditions: list, goals: list, meal_type: str = None, max_alts: int = 3):
    """Return (alternative_name, short_reasoning) or (None, reasoning_if_current_is_ok).

    Strategy:
    - Search for *similar* candidates (by name token overlap or shared attributes like "main_ingredient", "cuisine", or "meal_type").
    - Prefer same-type (beverage vs solid).
    - Only propose a candidate if it is measurably healthier for the user's goals (10% lower calories for weight-loss; >=10% more protein for protein goal).
    - If no similar healthier candidate exists, return (None, explanation) so current item remains.
    """
    if not base_dish:
        return []

    def _first(d, keys):
        for k in keys:
            if k in d and d[k] is not None:
                return d[k]
        return None

    base_name = (base_dish.get("dish_name") or "").strip()
    base_tokens = set([t for t in base_name.lower().replace('(', ' ').replace(')', ' ').replace(',', ' ').split() if len(t) > 2])
    base_cal = _first(base_dish, ["calories_kcal", "calories", "energy_kcal"]) or 0
    base_protein = _first(base_dish, ["protein_g", "protein"]) or 0
    base_sod = _first(base_dish, ["sodium_mg", "sodium"]) or 0
    base_sug = _first(base_dish, ["free_sugar_g", "sugar_g"]) or 0

    goals_norm = [g.lower() for g in (goals or [])]
    cond_norm = [c.lower() for c in (conditions or [])]

    bev_keywords = ("tea", "chai", "coffee", "latte", "milk", "juice", "smoothie", "shake", "soda", "cola", "beverage", "drink")
    base_name_l = base_name.lower()
    base_meal_type = (base_dish.get("meal_type") or "").lower()
    base_is_beverage = any(k in base_name_l for k in bev_keywords) or any(k in base_meal_type for k in ("drink", "beverage", "tea", "chai"))

    # normalize provided meal_type (breakfast/lunch/dinner/snacks)
    meal_time = (meal_type or "").lower()

    # Gather candidate set by searching for similar names (broad match)
    candidates = []
    try:
        candidates = _atlas_search_local(collection, base_name, limit=20)
    except Exception:
        candidates = []

    # If the above returned nothing, broaden search to first token
    if not candidates and base_name:
        first = base_name.split()[0]
        candidates = _atlas_search_local(collection, first, limit=20)

    # Normalize and filter candidates: exclude same exact dish and ingredient-like matches
    filtered = []
    for c in candidates:
        name = (c.get("dish_name") or c.get("name") or "").strip()
        if not name:
            continue
        if base_name and name.lower() == base_name.lower():
            continue
        # prefer same-type candidates only
        name_l = name.lower()
        is_bev = any(k in name_l for k in bev_keywords) or any(k in (c.get("meal_type") or "").lower() for k in ("drink", "beverage", "tea", "chai"))
        if is_bev != base_is_beverage:
            continue
        # ensure candidate's declared meal_type (if present) matches the current meal time when available
        cand_meal_type = (c.get("meal_type") or "").lower()
        if cand_meal_type and meal_time and meal_time not in cand_meal_type and meal_time != "snacks":
            # if meal_time is specific and candidate isn't labeled for that meal, skip
            continue
        # exclude ingredient-only suggestions (single token spices/masalas/oils/etc.)
        name_tokens = [t for t in name_l.replace('(', ' ').replace(')', ' ').replace(',', ' ').split() if t]
        if len(name_tokens) == 1 and name_tokens[0] not in base_tokens:
            # single-word candidate (likely an ingredient) - skip
            continue
        # require some similarity: token overlap or shared main_ingredient/cuisine/meal_type
        cand_tokens = set([t for t in name_l.replace('(', ' ').replace(')', ' ').replace(',', ' ').split() if len(t) > 2])
        shared = len(base_tokens & cand_tokens) > 0
        shared = shared or bool(c.get("main_ingredient") and c.get("main_ingredient").lower() in base_name_l)
        shared = shared or bool(c.get("cuisine") and c.get("cuisine").lower() in base_name_l)
        shared = shared or bool(c.get("meal_type") and c.get("meal_type").lower() in base_meal_type)
        if not shared:
            continue
        filtered.append(c)

    # Evaluate filtered candidates for 'healthier' criteria and produce per-candidate reasoning
    def candidate_score_and_reason(c):
        # produce a numeric score and a human-friendly reasoning string
        try:
            c_cal = float(_first(c, ["calories_kcal", "calories", "energy_kcal"]) or 0)
        except Exception:
            c_cal = 0.0
        try:
            c_pro = float(_first(c, ["protein_g", "protein"]) or 0)
        except Exception:
            c_pro = 0.0
        try:
            c_sod = float(_first(c, ["sodium_mg", "sodium"]) or 0)
        except Exception:
            c_sod = 0.0
        try:
            c_sug = float(_first(c, ["free_sugar_g", "sugar_g"]) or 0)
        except Exception:
            c_sug = 0.0

        score = 0
        # preferences based on goals
        if any("weight" in g or "lose" in g for g in goals_norm + cond_norm):
            if base_cal and c_cal and c_cal <= base_cal * 0.9:
                score += 2
        if any("protein" in g for g in goals_norm + cond_norm):
            if base_protein and c_pro and c_pro >= base_protein * 1.1:
                score += 2
        # small bonuses for lower sodium/sugar
        if base_sod and c_sod and c_sod < base_sod:
            score += 1
        if base_sug and c_sug and c_sug < base_sug:
            score += 1

        # humanized reasoning
        cname = (c.get("dish_name") or c.get("name") or "").strip()
        bname = base_name
        cname_l = cname.lower()
        bname_l = bname.lower()

        # exact same name -> affirm positively
        if cname_l and cname_l == bname_l:
            reason = f"That's a good choice — {bname} already fits well with your goals. Keep it up; focus on portion size and add some extra vegetables or a lean protein on the side to boost results."
            return score, reason

        # token overlap: similar dish with small tweaks
        cand_tokens = set([t for t in cname_l.replace('(', ' ').replace(')', ' ').replace(',', ' ').split() if len(t) > 2])
        shared = bool(base_tokens & cand_tokens)
        # compute simple deltas
        cal_delta_pct = 0
        if base_cal:
            try:
                cal_delta_pct = round(100.0 * (1 - (c_cal / base_cal)), 1)
            except Exception:
                cal_delta_pct = 0
        pro_delta = round((c_pro - (base_protein or 0)), 1)

        if shared and (abs(cal_delta_pct) < 30 and abs(pro_delta) < max(1, (base_protein or 1) * 0.5)):
            tweaks = []
            if cal_delta_pct > 0:
                tweaks.append(f"~{cal_delta_pct}% fewer calories")
            if pro_delta > 0:
                tweaks.append(f"{pro_delta}g more protein")
            extra = ", ".join(tweaks) if tweaks else "a few small tweaks"
            reason = f"Nice — {cname} is similar to {bname}. It's already a good choice; with {extra} it can help your weight-loss and muscle goals even more. Try small changes like less oil, more veggies, or a protein side."
            return score, reason

        # clearly healthier candidate
        if (base_cal and cal_delta_pct >= 10) or (pro_delta >= max(1, (base_protein or 0) * 0.1)):
            parts = []
            if base_cal and cal_delta_pct >= 10:
                parts.append(f"about {int(cal_delta_pct)}% fewer calories")
            if pro_delta >= 1:
                parts.append(f"{pro_delta}g more protein")
            if c_sod and base_sod and c_sod < base_sod:
                parts.append("lower sodium")
            why = " and ".join(parts)
            reason = f"Consider {cname} as a better option than {bname} because it has {why}, which supports fat loss and muscle maintenance. Try swapping it in for one meal a day to see how you feel."
            return score, reason

        # fallback humanized message
        reason = f"{cname} is similar to {bname}. The benefit is modest — either choice can work if you control portions and add veggies or protein."
        return score, reason


    scored = []
    for c in filtered:
        sc, rsn = candidate_score_and_reason(c)
        if sc > 0:
            scored.append((sc, rsn, c))

    # sort by score then keep top max_alts
    scored = sorted(scored, key=lambda x: x[0], reverse=True)[:max_alts]

    if not scored:
        return []

    alts = []
    for sc, rsn, c in scored:
        name = c.get("dish_name") or c.get("name") or "(alternative)"
        alts.append({"name": name, "reasoning": rsn})
    return alts


# run the block using the existing userInfo and mealLog variables
def mongo_db_alternatives_block():
    global mongoReasoning
    mongoReasoning = []
    m_uri = _safe_get_env("MONGO_URI")
    if not m_uri or MongoClient is None:
        # skip MongoDB alternatives silently when not configured
        return mongoReasoning

    try:
        client = MongoClient(m_uri)
        mdb = client.get_database("FoodData")
        food_col = mdb.get_collection("food_collection")
        subs_col = mdb.get_collection("ingredient_substitutes")
    except Exception:
        # fail silently on MongoDB connection errors
        return mongoReasoning

    for meal_type, info in (mealLog or {}).items():
        # Handle new format: direct array of food names
        if isinstance(info, list):
            for food in info:
                if isinstance(food, str):
                    # split combined food entries into separate items (e.g., 'Roasted chana or a small banana')
                    items = _split_food_items(food)
                    for item in items:
                        # find base dish for this single item
                        found = _atlas_search_local(food_col, item, limit=1)
                        base = found[0] if found else {"dish_name": item}

                        alternatives = _find_similar_healthier_candidates(
                            food_col,
                            subs_col,
                            base,
                            userInfo.get("health_conditions"),
                            userInfo.get("health_goals"),
                            meal_type=meal_type,
                            max_alts=3
                        )

                        if not alternatives:
                            # no healthier alternatives found — keep current (item-level)
                            mongoReasoning.append({
                                "mealType": meal_type,
                                "current": item,
                                "base_doc": base,
                                "alternatives": [{"name": item, "reasoning": "Kept: no similar healthier alternative found in DB."}]
                            })
                        else:
                            mongoReasoning.append({
                                "mealType": meal_type,
                                "current": item,
                                "base_doc": base,
                                "alternatives": alternatives
                            })
        # Handle old format: {"foods": [...]}
        elif isinstance(info, dict) and "foods" in info:
            for food in (info.get("foods") or []):
                if isinstance(food, str):
                    # split combined food entries into separate items (e.g., 'Roasted chana or a small banana')
                    items = _split_food_items(food)
                    for item in items:
                        # find base dish for this single item
                        found = _atlas_search_local(food_col, item, limit=1)
                        base = found[0] if found else {"dish_name": item}

                        alternatives = _find_similar_healthier_candidates(
                            food_col,
                            subs_col,
                            base,
                            userInfo.get("health_conditions"),
                            userInfo.get("health_goals"),
                            meal_type=meal_type,
                            max_alts=3
                        )

                        if not alternatives:
                            # no healthier alternatives found — keep current (item-level)
                            mongoReasoning.append({
                                "mealType": meal_type,
                                "current": item,
                                "base_doc": base,
                                "alternatives": [{"name": item, "reasoning": "Kept: no similar healthier alternative found in DB."}]
                            })
                        else:
                            mongoReasoning.append({
                                "mealType": meal_type,
                                "current": item,
                                "base_doc": base,
                                "alternatives": alternatives
                            })
                elif isinstance(food, dict) and "name" in food:
                    # Handle old format with food objects
                    food_name = food["name"]
                    items = _split_food_items(food_name)
                    for item in items:
                        # find base dish for this single item
                        found = _atlas_search_local(food_col, item, limit=1)
                        base = found[0] if found else {"dish_name": item}

                        alternatives = _find_similar_healthier_candidates(
                            food_col,
                            subs_col,
                            base,
                            userInfo.get("health_conditions"),
                            userInfo.get("health_goals"),
                            meal_type=meal_type,
                            max_alts=3
                        )

                        if not alternatives:
                            # no healthier alternatives found — keep current (item-level)
                            mongoReasoning.append({
                                "mealType": meal_type,
                                "current": item,
                                "base_doc": base,
                                "alternatives": [{"name": item, "reasoning": "Kept: no similar healthier alternative found in DB."}]
                            })
                        else:
                            mongoReasoning.append({
                                "mealType": meal_type,
                                "current": item,
                                "base_doc": base,
                                "alternatives": alternatives
                            })

    # do not log detailed mongoReasoning here

    return mongoReasoning


# Execute the block now (keeps it separate from the existing logic and files)
mongo_db_alternatives_block()


# Build a compact, nutrition-aware preview of mongo substitutions and split combined meal items
mongo_swaps_preview = []
meal_items_list = []
try:
    # create a per-food item list from mealLog so each food is suggested separately
    for meal_type, info in (mealLog or {}).items():
        for food in (info.get("foods") or []):
            items = _split_food_items(food)
            for it in items:
                meal_items_list.append({"mealType": meal_type, "current": it})

    # If Mongo is available, try to re-open a lightweight connection to fetch nutrient docs
    m_uri = _safe_get_env("MONGO_URI")
    client_tmp = None
    food_col_tmp = None
    if m_uri and MongoClient is not None:
        try:
            client_tmp = MongoClient(m_uri, serverSelectionTimeoutMS=2000)
            mdb_tmp = client_tmp.get_database("FoodData")
            food_col_tmp = mdb_tmp.get_collection("food_collection")
        except Exception:
            food_col_tmp = None

    # Build preview: for each mongoReasoning entry, include base name, each alternative,
    # and a short computed hint (e.g., "more protein", "fewer calories") when nutrient docs are available.
    for entry in mongoReasoning:
        base_name = entry.get("current")
        base_doc = entry.get("base_doc") or {}
        base_cal = None
        base_pro = None
        try:
            base_cal = float(base_doc.get("calories_kcal") or base_doc.get("calories") or 0)
        except Exception:
            base_cal = None
        try:
            base_pro = float(base_doc.get("protein_g") or base_doc.get("protein") or 0)
        except Exception:
            base_pro = None

        alts_preview = []
        for alt in entry.get("alternatives", []):
            alt_name = alt.get("name")
            alt_reason = alt.get("reasoning", "")
            alt_doc = None
            alt_cal = None
            alt_pro = None
            hint = alt_reason

            # attempt to fetch alt nutrition from DB by name if we have a collection
            if food_col_tmp is not None and isinstance(alt_name, str) and alt_name:
                try:
                    found = _atlas_search_local(food_col_tmp, alt_name, limit=1)
                    if found:
                        alt_doc = found[0]
                except Exception:
                    alt_doc = None

            if not alt_doc and food_col_tmp is not None and isinstance(alt_name, str):
                # fallback regex search
                try:
                    res = list(food_col_tmp.find({"dish_name": {"$regex": alt_name, "$options": "i"}}, {"_id": 0}).limit(1))
                    if res:
                        alt_doc = res[0]
                except Exception:
                    alt_doc = None

            if alt_doc:
                try:
                    alt_cal = float(alt_doc.get("calories_kcal") or alt_doc.get("calories") or 0)
                except Exception:
                    alt_cal = None
                try:
                    alt_pro = float(alt_doc.get("protein_g") or alt_doc.get("protein") or 0)
                except Exception:
                    alt_pro = None

                # compute simple deltas to surface why this alt is useful
                parts = []
                if base_cal and alt_cal is not None:
                    if alt_cal < base_cal:
                        parts.append(f"~{int(round(100*(1 - (alt_cal/base_cal))))}% fewer kcal")
                    elif alt_cal > base_cal:
                        parts.append(f"~{int(round(100*((alt_cal/base_cal) - 1)))}% more kcal")
                if base_pro is not None and alt_pro is not None:
                    if alt_pro > base_pro:
                        parts.append(f"{round(alt_pro - base_pro,1)}g more protein")
                if parts:
                    hint = f"{alt_reason} ({'; '.join(parts)})"

            # add small practical extra suggestions when protein seems low
            extra_suggestion = ""
            # if alt or base protein values indicate low protein (heuristic)
            prot_ok = False
            try:
                prot_val = None
                if alt_pro is not None:
                    prot_val = alt_pro
                elif base_pro is not None:
                    prot_val = base_pro
                if prot_val is not None and prot_val >= 5:
                    prot_ok = True
            except Exception:
                prot_ok = False

            if not prot_ok:
                # recommend small protein-boosting sides common in Indian kitchens
                extra_suggestion = "Serve with a small side of sprouts or a spoon of curd/paneer to boost protein."

            alts_preview.append({
                "alt_name": alt_name,
                "hint": hint,
                "extra_suggestion": extra_suggestion
            })

        mongo_swaps_preview.append({
            "mealType": entry.get("mealType"),
            "current": base_name,
            "base_cal": base_cal,
            "base_protein": base_pro,
            "alternatives": alts_preview
        })

except Exception:
    # do not let preview generation break the main flow
    mongo_swaps_preview = []
    meal_items_list = []

@app.post("/store_user_info")
async def store_user_info(data: UserInfoModel):
    try:
        print(f"__file__: {__file__}")
        user_info = data.userInfo
        print(f"USER_DATA_FILE: {USER_DATA_FILE}")
        with open(USER_DATA_FILE, "w", encoding="utf-8") as f:
            json.dump(user_info, f, ensure_ascii=False, indent=2)
        print(f"User info saved to {USER_DATA_FILE}: {user_info}")
        logger.info("userInfo stored successfully.")
        return {"message": "userInfo stored successfully"}
    except Exception as e:
        logger.error(f"Error storing userInfo: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")



@app.post("/store_environment_context")
async def store_environment_context(data: EnvironmentContextModel):
    try:
        env_ctx = data.environmentContext
        with open(ENVIRONMENT_CONTEXT_FILE, "w", encoding="utf-8") as f:
            json.dump(env_ctx, f, ensure_ascii=False, indent=2)
        logger.info("environmentContext stored successfully.")
        return {"message": "environmentContext stored successfully"}
    except Exception as e:
        logger.error(f"Error storing environmentContext: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/store_meal_log")
async def store_meal_log(data: MealLogModel):
    try:
        meal_log = data.mealLog
        with open(MEAL_LOG_FILE, "w", encoding="utf-8") as f:
            json.dump(meal_log, f, ensure_ascii=False, indent=2)
        logger.info("mealLog stored successfully.")
        
        # Generate insights after storing meal log
        insights = generate_insights()
        
        # Save insights to file
        with open("insights.json", "w", encoding="utf-8") as f:
            json.dump(insights, f, ensure_ascii=False, indent=2)
        
        return {"message": "mealLog stored successfully", "insights": insights}
    except Exception as e:
        logger.error(f"Error storing mealLog: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/insights")
async def get_insights():
    try:
        if os.path.exists("insights.json"):
            with open("insights.json", "r", encoding="utf-8") as f:
                return json.load(f)
        else:
            return {"error": "Insights not available"}
    except Exception as e:
        logger.error(f"Error loading insights: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

def generate_insights():
    # Load necessary data
    userInfo = load_user_info()
    mealLog = load_meal_log()
    environmentContext = load_environment_context()
    
    # Call mongo block to populate mongoReasoning
    mongo_db_alternatives_block()
    mongoReasoning = load_mongo_reasoning()
    
    # For simplicity, use empty for others if not populated
    context_summary = []
    substitutions_from_posts = []
    mongo_swaps_preview = []
    meal_items_list = []
    combined_context_str = ""
    
    # Populate meal_items_list from mealLog
    for meal_type, data in mealLog.items():
        if isinstance(data, list):
            foods = data
        else:
            foods = data.get('foods', [])
        for it in foods:
            meal_items_list.append({"mealType": meal_type, "current": it})
    
    # The rest of the code...
    
    # The LLM generation code here
    system_instruction = (
        "You are a clinical-aware nutrition assistant. "
        "Use the provided userInfo, mealLog, mongoReasoning (from DB alternatives), and matched posts to analyze dietary choices and give concise, practical guidance. "
        "Do NOT give medical diagnoses; give food and behavior suggestions consistent with the user's goals and conditions. Consider environmentContext (availability, season) when proposing swaps or meal ideas. "
        "Also consider user lifestyle factors: budget_for_food (prioritize affordable options), occupation_type (tailor to daily routine), work_schedule (align meal timings), access_to_kitchen (limit cooking-heavy suggestions if limited), stress_level (suggest comforting foods if high), meal_source (contextualize for food safety and preparation).\n\n"
        "USER_INFO: " + json.dumps(userInfo) + "\n"
        "MEAL_LOG: " + json.dumps(mealLog) + "\n"
        "ENVIRONMENT_CONTEXT: " + json.dumps(environmentContext) + "\n"
        "MONGO_REASONING: " + json.dumps(mongoReasoning) + "\n"
    )

    contents = (
        "You have access to relevant posts from the food database for context (short list):\n"
        + "\n".join(context_summary)
        + "\n\nAlso consider user lifestyle factors (budget_for_food, occupation_type, work_schedule, access_to_kitchen, stress_level, meal_source) when choosing recommendations; tailor suggestions to be affordable, suitable for routine, and realistic given constraints.\n\n"
        + "Using the system instruction (which includes userInfo, mealLog and mongoReasoning), produce a single JSON object (only JSON, no extra text) with the following keys:\n"
        "1) key_insight (string): a concise 4-5 line insight that explicitly references the user's profile (conditions, goals, BMI) and the meals the user actually ate today; describe how those meals are likely to affect the user's health (positive or negative impacts), and note any immediate concerns or helpful patterns observed. Make it personal by addressing the user by their name, e.g., 'Mr. Sharma,'.\n"
        "2) modern_approach (string): a 3-4 line suggestion using modern foods or methods to help the user's goals; use the recommendations and comments from the matched posts where applicable.\n"
        "3) heritage_alternative (string): a 3-4 line set of Indian/heritage alternatives (specific Indian foods or preparations) relevant to the user's goals, drawn from food_data.json recommendations where applicable.\n"
        "4) simple_swap (array): an array of objects. Each object MUST have: mealType, current, alternative, reasoning (1-2 lines). Use the matched posts, substitutions_from_posts, and mongoReasoning to decide these swaps. The model should decide whether a swap is needed; if not, keep current as alternative and explain why.\n"
        "5) general_summary (array): a 4-5 step action plan for the next logging (next day). Each step should be a short, encouraging, and realistic action that incorporates the simple_swap, modern_approach, and heritage_alternative where relevant. Subtly reference environmentContext (availability/season) and user lifestyle factors (budget_for_food/occupation_type/work_schedule/access_to_kitchen/stress_level/meal_source) in relevant steps — e.g., mention using an available ingredient for breakfast or choosing a warm monsoon-friendly lunch, or suggesting portable snacks for gig work — but keep it low-key. Include subtle suggestions for accessing the simple_swap alternatives based on occupation_type (e.g., 'as a student, you could prep this during study breaks'), work_schedule (e.g., 'for night shifts, keep this ready the evening before'), access_to_kitchen (e.g., 'if kitchen access is limited, look for pre-made versions at local stores'), and meal_source (e.g., 'when eating roadside, ask vendors for healthier preparation of this alternative'). Prioritize gentle, doable swaps rather than strict overhauls. Personalize each step by mentioning the user's name or relevant profile details.\n\n"
        "When answering, heavily use the matched posts and the 'recommendations' fields from food_data.json, the digi_data.json content, and any previous insights in insights.json as context. If you cite specific suggested foods, ensure they are realistic Indian items.\n"
        "Return ONLY the JSON object. Keep each string reasonably short (approx 3-4 lines for string fields, 4-5 short strings for general_summary).\n\n"
        "ADDITIONAL_CONTEXT: substitutions_from_posts: " + json.dumps(substitutions_from_posts[:6]) + "\n"
        +"ENVIRONMENT_CONTEXT: " + json.dumps(environmentContext) + "\n"
        +"MONGO_SWAPS_PREVIEW: " + json.dumps(mongo_swaps_preview[:12]) + "\n"
        +"MEAL_ITEMS_LIST: " + json.dumps(meal_items_list[:40]) + "\n"
        +"COMBINED_CONTEXT_PREVIEW:\n" + combined_context_str + "\n"
    )

    try:
        response = client.models.generate_content(
            model="gemini-1.5-flash",
            config=types.GenerateContentConfig(
                system_instruction=system_instruction
            ),
            contents=contents
        )

        raw = (response.text or "")
        insights = None
        try:
            insights = json.loads(raw)
        except Exception:
            import re
            m = re.search(r"(\{.*\})", raw, re.S)
            if m:
                try:
                    insights = json.loads(m.group(1))
                except Exception:
                    insights = {"error": "could not parse extracted JSON", "raw": raw}
            else:
                insights = {"error": "no json found in model output", "raw": raw}

        # Post-process simple_swap to ensure one entry per food item
        if insights and isinstance(insights, dict) and 'simple_swap' in insights and isinstance(insights['simple_swap'], list):
            existing_swaps = {(s.get('mealType'), s.get('current')): s for s in insights['simple_swap']}
            new_swaps = []
            for item in meal_items_list:
                key = (item['mealType'], item['current'])
                if key in existing_swaps:
                    new_swaps.append(existing_swaps[key])
                else:
                    new_swaps.append({
                        'mealType': item['mealType'],
                        'current': item['current'],
                        'alternative': item['current'],
                        'reasoning': 'No swap needed; this food aligns well with your goals.'
                    })
            insights['simple_swap'] = new_swaps

        # --- Post-process: ensure each simple_swap item has a hasRecipe boolean
        def _augment_simple_swap_with_has_recipe(obj):
            """Use the LLM to decide hasRecipe for each simple_swap entry, fallback to heuristics on failure."""
            try:
                swaps = obj.get('simple_swap') if isinstance(obj, dict) else None
                if not swaps or not isinstance(swaps, list):
                    return

                # Prepare alternatives list for the model
                alternatives = []
                for s in swaps:
                    alt = s.get('alternative') if isinstance(s, dict) else None
                    if alt is None:
                        alternatives.append("")
                    else:
                        alternatives.append(str(alt))

                # LLM prompt: ask to return a JSON array with index and hasRecipe boolean
                system_prompt = (
                    "You are a utility that classifies whether a suggested food alternative "
                    "is something that typically has a home-cookable recipe (hasRecipe=true) "
                    "or is usually a prepared/ordered-from-vendor/restaurant item (hasRecipe=false). "
                    "Return ONLY a JSON array of objects with fields: index (int), alternative (string), hasRecipe (true|false), reason (short string). "
                    "Be concise. Use common-sense knowledge about Indian and street foods. See <attachments> above for file contents."
                )

                contents = "\n".join([f"[{i}] {a}" for i, a in enumerate(alternatives)])

                model_result = None
                try:
                    resp = client.models.generate_content(
                        model="gemini-1.5-flash",
                        config=types.GenerateContentConfig(system_instruction=system_prompt),
                        contents=contents
                    )
                    raw_text = resp.text or ""
                    try:
                        model_result = json.loads(raw_text)
                    except Exception:
                        import re
                        m = re.search(r"(\[\s*\{.*\}\s*\])", raw_text, re.S)
                        if m:
                            try:
                                model_result = json.loads(m.group(1))
                            except Exception:
                                model_result = None
                except Exception:
                    model_result = None

                # Fallback heuristics in case LLM fails or returns unexpected output
                restaurant_indicators = [
                    'order', 'ordered', 'restaurant', 'stall', 'vendor', 'takeaway', 'delivery',
                    'zomato', 'swiggy', 'street', 'food court', 'fast food', 'canteen', 'mess'
                ]
                home_keywords = [
                    'dal', 'sabzi', 'curry', 'roti', 'paratha', 'rice', 'khichdi', 'idli', 'dosa',
                    'sandwich', 'omelette', 'egg', 'paneer', 'salad', 'smoothie', 'porridge',
                    'upma', 'poha', 'pulao', 'kheer', 'bhaji', 'stew', 'stir fry', 'lentil',
                    'beans', 'vegetable', 'sabji', 'chapati', 'soup', 'pickle'
                ]

                if isinstance(model_result, list) and all(isinstance(i, dict) for i in model_result):
                    # map results by index
                    for item in model_result:
                        try:
                            idx = int(item.get('index'))
                            if 0 <= idx < len(swaps):
                                swaps[idx]['hasRecipe'] = bool(item.get('hasRecipe'))
                                # preserve a short reason if provided
                                if 'reason' in item and item.get('reason'):
                                    swaps[idx]['hasRecipeReason'] = str(item.get('reason'))
                                # Generate tags if hasRecipe is true
                                if swaps[idx]['hasRecipe']:
                                    alt = swaps[idx].get('alternative', '')
                                    swaps[idx]['tags'] = generate_tags(alt)
                        except Exception:
                            continue
                else:
                    # apply heuristics per alternative
                    for i, s in enumerate(swaps):
                        try:
                            alt = s.get('alternative') or ''
                            alt_l = str(alt).lower()
                            has_recipe = True
                            if any(ind in alt_l for ind in restaurant_indicators):
                                has_recipe = False
                            elif any(hk in alt_l for hk in home_keywords):
                                has_recipe = True
                            else:
                                tokens = [t for t in alt_l.split() if t]
                                if len(tokens) <= 1:
                                    single = tokens[0] if tokens else ''
                                    has_recipe = bool(single and any(k in single for k in home_keywords))
                                else:
                                    has_recipe = True
                            s['hasRecipe'] = has_recipe
                            # Generate tags if hasRecipe is true
                            if s['hasRecipe']:
                                s['tags'] = generate_tags(alt)
                        except Exception:
                            s['hasRecipe'] = True
                            # Generate tags since defaulting to hasRecipe=True
                            alt = s.get('alternative', '')
                            s['tags'] = generate_tags(alt)
            except Exception:
                # don't let augmentation break the main flow
                return

        _augment_simple_swap_with_has_recipe(insights)

        out_path = os.path.join(os.path.dirname(__file__), "insights.json")
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(insights, f, ensure_ascii=False, indent=2)

        return insights

    except Exception:
        # suppress LLM errors from logging here
        return {"error": "Failed to generate insights"}
system_instruction = (
    "You are a clinical-aware nutrition assistant. "
    "Use the provided userInfo, mealLog, mongoReasoning (from DB alternatives), and matched posts to analyze dietary choices and give concise, practical guidance. "
    "Do NOT give medical diagnoses; give food and behavior suggestions consistent with the user's goals and conditions. Consider environmentContext (availability, season) when proposing swaps or meal ideas. "
    "Also consider user lifestyle factors: budget_for_food (prioritize affordable options), occupation_type (tailor to daily routine), work_schedule (align meal timings), access_to_kitchen (limit cooking-heavy suggestions if limited), stress_level (suggest comforting foods if high), meal_source (contextualize for food safety and preparation).\n\n"
    "USER_INFO: " + json.dumps(userInfo) + "\n"
    "MEAL_LOG: " + json.dumps(mealLog) + "\n"
    "ENVIRONMENT_CONTEXT: " + json.dumps(environmentContext) + "\n"
    "MONGO_REASONING: " + json.dumps(mongoReasoning) + "\n"
)

# Compose prompt contents; include post substitutions and compact context
contents = (
    "You have access to relevant posts from the food database for context (short list):\n"
    + "\n".join(context_summary)
    + "\n\nAlso consider user lifestyle factors (budget_for_food, occupation_type, work_schedule, access_to_kitchen, stress_level, meal_source) when choosing recommendations; tailor suggestions to be affordable, suitable for routine, and realistic given constraints.\n\n"
    + "Using the system instruction (which includes userInfo, mealLog and mongoReasoning), produce a single JSON object (only JSON, no extra text) with the following keys:\n"
    "1) key_insight (string): a concise 4-5 line insight that explicitly references the user's profile (conditions, goals, BMI) and the meals the user actually ate today; describe how those meals are likely to affect the user's health (positive or negative impacts), and note any immediate concerns or helpful patterns observed. Make it personal by addressing the user by their name, e.g., 'Mr. Sharma,'.\n"
    "2) modern_approach (string): a 3-4 line suggestion using modern foods or methods to help the user's goals; use the recommendations and comments from the matched posts where applicable.\n"
    "3) heritage_alternative (string): a 3-4 line set of Indian/heritage alternatives (specific Indian foods or preparations) relevant to the user's goals, drawn from food_data.json recommendations where applicable.\n"
    "4) simple_swap (array): an array of objects. Each object MUST have: mealType, current, alternative, reasoning (1-2 lines). Use the matched posts, substitutions_from_posts, and mongoReasoning to decide these swaps. The model should decide whether a swap is needed; if not, keep current as alternative and explain why.\n"
    "5) general_summary (array): a 4-5 step action plan for the next logging (next day). Each step should be a short, encouraging, and realistic action that incorporates the simple_swap, modern_approach, and heritage_alternative where relevant. Subtly reference environmentContext (availability/season) and user lifestyle factors (budget_for_food/occupation_type/work_schedule/access_to_kitchen/stress_level/meal_source) in relevant steps — e.g., mention using an available ingredient for breakfast or choosing a warm monsoon-friendly lunch, or suggesting portable snacks for gig work — but keep it low-key. Include subtle suggestions for accessing the simple_swap alternatives based on occupation_type (e.g., 'as a student, you could prep this during study breaks'), work_schedule (e.g., 'for night shifts, keep this ready the evening before'), access_to_kitchen (e.g., 'if kitchen access is limited, look for pre-made versions at local stores'), and meal_source (e.g., 'when eating roadside, ask vendors for healthier preparation of this alternative'). Prioritize gentle, doable swaps rather than strict overhauls. Personalize each step by mentioning the user's name or relevant profile details.\n\n"
    "When answering, heavily use the matched posts and the 'recommendations' fields from food_data.json, the digi_data.json content, and any previous insights in insights.json as context. If you cite specific suggested foods, ensure they are realistic Indian items.\n"
    "Return ONLY the JSON object. Keep each string reasonably short (approx 3-4 lines for string fields, 4-5 short strings for general_summary).\n\n"
    "ADDITIONAL_CONTEXT: substitutions_from_posts: " + json.dumps(substitutions_from_posts[:6]) + "\n"
    +"ENVIRONMENT_CONTEXT: " + json.dumps(environmentContext) + "\n"
    +"MONGO_SWAPS_PREVIEW: " + json.dumps(mongo_swaps_preview[:12]) + "\n"
    +"MEAL_ITEMS_LIST: " + json.dumps(meal_items_list[:40]) + "\n"
    +"COMBINED_CONTEXT_PREVIEW:\n" + combined_context_str + "\n"
)

try:
    response = client.models.generate_content(
        model="gemini-1.5-flash",
        config=types.GenerateContentConfig(
            system_instruction=system_instruction
        ),
        contents=contents
    )

    raw = (response.text or "")
    print("Raw LLM response:", raw)  # Debug print
    insights = None
    try:
        insights = json.loads(raw)
        print("Parsed insights:", insights)  # Debug print
    except Exception as e:
        print("JSON parse error:", e)  # Debug print
        import re
        m = re.search(r"(\{.*\})", raw, re.S)
        if m:
            try:
                insights = json.loads(m.group(1))
                print("Parsed from regex:", insights)  # Debug print
            except Exception as e2:
                print("Regex parse error:", e2)  # Debug print
                insights = {"error": "could not parse extracted JSON", "raw": raw}
        else:
            print("No JSON found in response")  # Debug print
            insights = {"error": "no json found in model output", "raw": raw}

    # Post-process simple_swap to ensure one entry per food item
    if insights and isinstance(insights, dict) and 'simple_swap' in insights and isinstance(insights['simple_swap'], list):
        existing_swaps = {(s.get('mealType'), s.get('current')): s for s in insights['simple_swap']}
        new_swaps = []
        for item in meal_items_list:
            key = (item['mealType'], item['current'])
            if key in existing_swaps:
                new_swaps.append(existing_swaps[key])
            else:
                new_swaps.append({
                    'mealType': item['mealType'],
                    'current': item['current'],
                    'alternative': item['current'],
                    'reasoning': 'No swap needed; this food aligns well with your goals.'
                })
        insights['simple_swap'] = new_swaps

    # --- Post-process: ensure each simple_swap item has a hasRecipe boolean
    def _augment_simple_swap_with_has_recipe(obj):
        """Use the LLM to decide hasRecipe for each simple_swap entry, fallback to heuristics on failure."""
        try:
            swaps = obj.get('simple_swap') if isinstance(obj, dict) else None
            if not swaps or not isinstance(swaps, list):
                return

            # Prepare alternatives list for the model
            alternatives = []
            for s in swaps:
                alt = s.get('alternative') if isinstance(s, dict) else None
                if alt is None:
                    alternatives.append("")
                else:
                    alternatives.append(str(alt))

            # LLM prompt: ask to return a JSON array with index and hasRecipe boolean
            system_prompt = (
                "You are a utility that classifies whether a suggested food alternative "
                "is something that typically has a home-cookable recipe (hasRecipe=true) "
                "or is usually a prepared/ordered-from-vendor/restaurant item (hasRecipe=false). "
                "Return ONLY a JSON array of objects with fields: index (int), alternative (string), hasRecipe (true|false), reason (short string). "
                "Be concise. Use common-sense knowledge about Indian and street foods. See <attachments> above for file contents."
            )

            contents = "\n".join([f"[{i}] {a}" for i, a in enumerate(alternatives)])

            model_result = None
            try:
                resp = client.models.generate_content(
                    model="gemini-1.5-flash",
                    config=types.GenerateContentConfig(system_instruction=system_prompt),
                    contents=contents
                )
                raw_text = resp.text or ""
                try:
                    model_result = json.loads(raw_text)
                except Exception:
                    import re
                    m = re.search(r"(\[\s*\{.*\}\s*\])", raw_text, re.S)
                    if m:
                        try:
                            model_result = json.loads(m.group(1))
                        except Exception:
                            model_result = None
            except Exception:
                model_result = None

            # Fallback heuristics in case LLM fails or returns unexpected output
            restaurant_indicators = [
                'order', 'ordered', 'restaurant', 'stall', 'vendor', 'takeaway', 'delivery',
                'zomato', 'swiggy', 'street', 'food court', 'fast food', 'canteen', 'mess'
            ]
            home_keywords = [
                'dal', 'sabzi', 'curry', 'roti', 'paratha', 'rice', 'khichdi', 'idli', 'dosa',
                'sandwich', 'omelette', 'egg', 'paneer', 'salad', 'smoothie', 'porridge',
                'upma', 'poha', 'pulao', 'kheer', 'bhaji', 'stew', 'stir fry', 'lentil',
                'beans', 'vegetable', 'sabji', 'chapati', 'soup', 'pickle'
            ]

            if isinstance(model_result, list) and all(isinstance(i, dict) for i in model_result):
                # map results by index
                for item in model_result:
                    try:
                        idx = int(item.get('index'))
                        if 0 <= idx < len(swaps):
                            swaps[idx]['hasRecipe'] = bool(item.get('hasRecipe'))
                            # preserve a short reason if provided
                            if 'reason' in item and item.get('reason'):
                                swaps[idx]['hasRecipeReason'] = str(item.get('reason'))
                            # Generate tags if hasRecipe is true
                            if swaps[idx]['hasRecipe']:
                                alt = swaps[idx].get('alternative', '')
                                swaps[idx]['tags'] = generate_tags(alt)
                    except Exception:
                        continue
            else:
                # apply heuristics per alternative
                for i, s in enumerate(swaps):
                    try:
                        alt = s.get('alternative') or ''
                        alt_l = str(alt).lower()
                        has_recipe = True
                        if any(ind in alt_l for ind in restaurant_indicators):
                            has_recipe = False
                        elif any(hk in alt_l for hk in home_keywords):
                            has_recipe = True
                        else:
                            tokens = [t for t in alt_l.split() if t]
                            if len(tokens) <= 1:
                                single = tokens[0] if tokens else ''
                                has_recipe = bool(single and any(k in single for k in home_keywords))
                            else:
                                has_recipe = True
                        s['hasRecipe'] = has_recipe
                        # Generate tags if hasRecipe is true
                        if s['hasRecipe']:
                            s['tags'] = generate_tags(alt)
                    except Exception:
                        s['hasRecipe'] = True
                        # Generate tags since defaulting to hasRecipe=True
                        alt = s.get('alternative', '')
                        s['tags'] = generate_tags(alt)
        except Exception:
            # don't let augmentation break the main flow
            return

    _augment_simple_swap_with_has_recipe(insights)

    out_path = os.path.join(os.path.dirname(__file__), "insights.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(insights, f, ensure_ascii=False, indent=2)

except Exception:
    # suppress LLM errors from logging here
    pass
