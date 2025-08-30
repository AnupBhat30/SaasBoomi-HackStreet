import json
import os
import re
from pathlib import Path

INPUT = Path("posts_data.json")
OUTPUT = Path("food_data.json")

KEYWORD_NUTRIENT_MAP = {
    "low carb": "low_carb",
    "low_carb": "low_carb",
    "low gi": "low_gi",
    "low_gi": "low_gi",
    "low sugar": "low_sugar",
    "high protein": "high_protein",
    "high_protein": "high_protein",
    "high fiber": "high_fiber",
    "high_fiber": "high_fiber",
    "fiber": "high_fiber",
    "protein": "high_protein",
    "behavioral": "behavioral",
}

RECIPE_KEYWORDS = re.compile(r"\b(recipe|serve|cook|bake|roti|paneer|dal|make|prepare|cup|tbsp|tsp|mix|stir fry|grill|saute)\b", re.I)
SWAP_KEYWORDS = re.compile(r"\b(swap|replace|instead of|substitute|replace with|mix .* with)\b", re.I)
 
# A small curated list of common foods to look for in comments/posts. Keep lowercase.
FOOD_KEYWORDS = {
    "eggs", "paneer", "dal", "roti", "chicken", "fish", "salad",
    "oats", "yogurt", "beans", "lentils", "tofu", "rice", "quinoa",
    "broccoli", "spinach", "nuts", "almonds", "walnuts", "cheese",
    "milk", "paneer", "apple", "banana", "avocado",
}


def normalize_list(value):
    if not value:
        return []
    if isinstance(value, list):
        return [str(x).strip().lower() for x in value if x]
    if isinstance(value, str):
        return [v.strip().lower() for v in re.split(r"[,;|]", value) if v.strip()]
    return []


def detect_meal_types(text: str):
    text = (text or "").lower()
    types = []
    for k in ["breakfast", "lunch", "dinner", "snack", "dessert", "baking", "tea", "snack"]:
        if k in text:
            types.append(k)
    if "lifestyle" in text or "exercise" in text:
        types.append("lifestyle")
    return sorted(set(types))


def make_search_keywords(post):
    keywords = set()
    title = post.get("title") or post.get("post_title") or ""
    for part in [title, " ".join(normalize_list(post.get("queries"))), " ".join(normalize_list(post.get("tags")))]:
        for tok in re.split(r"\W+", part.lower()):
            if len(tok) > 2:
                keywords.add(tok)
    return sorted(keywords)


def classify_recommendation(text: str):
    if SWAP_KEYWORDS.search(text):
        return "swap"
    if RECIPE_KEYWORDS.search(text):
        return "recipe"
    return "suggestion"


def extract_nutrients(text: str):
    t = text.lower()
    nutrients = {}
    if re.search(r"low\s*-?carb|lowcarb|low carb", t):
        nutrients["low_carb"] = True
    if re.search(r"low\s*-?gi|low gi|low-glycemic|low glycemic", t):
        nutrients["low_gi"] = True
    if re.search(r"high\s*-?protein|high protein|protein-rich|protein rich", t):
        nutrients["high_protein"] = True
    if re.search(r"high\s*-?fiber|high fiber|fibre|fiber-rich", t):
        nutrients["high_fiber"] = True
    if re.search(r"low\s*-?sugar|sugar[- ]?free|no sugar", t):
        nutrients["low_sugar"] = True
    if re.search(r"exercise|portion|portion control|behavior|habit|lifestyle", t):
        nutrients["behavioral"] = True
    return nutrients


def extract_foods(text: str, limit: int = 5):
    """Return up to `limit` unique food keywords found in `text`.

    Uses a simple keyword match against FOOD_KEYWORDS. Returns lowercase strings.
    """
    if not text:
        return []
    t = text.lower()
    found = []
    for kw in FOOD_KEYWORDS:
        # word boundary to avoid partial matches
        if re.search(r"\b" + re.escape(kw) + r"\b", t):
            found.append(kw)
            if len(found) >= limit:
                break
    return sorted(dict.fromkeys(found))


def get_comment_text(c):
    if c is None:
        return ""
    if isinstance(c, str):
        return c.strip()
    if isinstance(c, dict):
        return (c.get("text") or c.get("comment") or "").strip()
    return str(c)


def transform_posts(posts):
    out = []
    for i, p in enumerate(posts, start=1):
        title = p.get("title") or p.get("post_title") or ""
        queries = normalize_list(p.get("queries"))
        tags = normalize_list(p.get("tags"))
        conditions = sorted(set(queries + tags))
        meal_types = detect_meal_types(title + " \n " + (p.get("text") or "") + " \n " + " ".join(tags))
        search_keywords = make_search_keywords(p)

        recs = []
        comments = p.get("comments") or []
        for idx, c in enumerate(comments, start=1):
            text = get_comment_text(c)
            if not text:
                continue
            typ = classify_recommendation(text)
            nutrients = extract_nutrients(text)
            snippet = text if len(text) <= 200 else text[:197] + "..."
            recs.append({
                "type": typ,
                "text": text,
                "source_comment_snippet": snippet,
                "nutrients": nutrients,
            })

        # Collect foods mentioned across comments and post text (simple keyword matching)
        foods_set = []
        # scan comments first
        for c in comments:
            ct = get_comment_text(c)
            if not ct:
                continue
            for f in extract_foods(ct, limit=5):
                if f not in foods_set:
                    foods_set.append(f)
                if len(foods_set) >= 5:
                    break
            if len(foods_set) >= 5:
                break

        # if not enough, scan post text and title
        if len(foods_set) < 5:
            for part in [title, (p.get("text") or "")]:
                for f in extract_foods(part, limit=5):
                    if f not in foods_set:
                        foods_set.append(f)
                    if len(foods_set) >= 5:
                        break
                if len(foods_set) >= 5:
                    break

        # If there are no comments but the post text contains advice, add a recommendation from post text
        if not recs and (p.get("text") or "").strip():
            full_text = (p.get("text") or "").strip()
            recs.append({
                "type": classify_recommendation(full_text),
                "text": full_text,
                "source_comment_snippet": full_text[:200],
                "nutrients": extract_nutrients(full_text),
            })

        out.append({
            "id": f"post-{i:03d}",
            "post_title": title,
            "post_description": p.get("text") or "",
            "conditions": conditions,
            "query_tags": queries or tags,
            "meal_types": meal_types,
            "search_keywords": search_keywords,
            "recommendations": recs,
            "foods": foods_set,
        })
    return out


def main():
    if not INPUT.exists():
        print(f"Input file {INPUT} not found. Run this script from the folder containing posts_data.json.")
        return
    with INPUT.open("r", encoding="utf-8") as f:
        data = json.load(f)

    if isinstance(data, dict):
        posts = data.get("data") or data.get("posts") or [data]
    elif isinstance(data, list):
        posts = data
    else:
        posts = []

    transformed = transform_posts(posts)

    with OUTPUT.open("w", encoding="utf-8") as f:
        json.dump(transformed, f, ensure_ascii=False, indent=2)

    print(f"Wrote {len(transformed)} posts to {OUTPUT}")


if __name__ == "__main__":
    main()