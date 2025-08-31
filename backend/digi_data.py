import os
import json
from dotenv import load_dotenv
from pydantic import BaseModel
from google import genai
from google.genai import types
import fitz  # PyMuPDF
import pytesseract
from PIL import Image
import io
import re
from typing import List

# Load API key
load_dotenv()
key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=key)

pdf_file = "scan.pdf"
# Configuration: number of objects to generate and chunk size for heuristics
MAX_ITEMS = 200
CHUNK_SIZE = 120
OUTPUT_FILE = "digi_data.json"

# Try extracting text
doc = fitz.open(pdf_file)
text = ""
for page in doc:
    page_text = page.get_text("text")
    if page_text.strip():
        text += page_text + "\n"

# If no text found → fallback to OCR
if not text.strip():
    print("⚠️ No extractable text found, using OCR...")
    for page in doc:
        pix = page.get_pixmap()
        img = Image.open(io.BytesIO(pix.tobytes("png")))
        text += pytesseract.image_to_string(img) + "\n"
doc.close()

# Schema
class HealthPost(BaseModel):
    title: str
    text: str
    comments: list[str]
    queries: list[str]
    tags: list[str]

# Helper: try to extract JSON substring if model returns extra text
def extract_json(text: str):
    # try direct load
    try:
        return json.loads(text)
    except Exception:
        pass
    # find the first '[' and last ']'
    start = text.find('[')
    end = text.rfind(']')
    if start != -1 and end != -1 and end > start:
        try:
            return json.loads(text[start:end+1])
        except Exception:
            pass
    # no JSON found
    return None


def generate_local_objects(text: str, max_items: int = 40) -> List[dict]:
    """Fallback extractor that heuristically creates up to max_items objects from text."""
    objs: List[dict] = []
    # find question-like lines
    q_matches = re.findall(r"([^.\n]{20,}?\?)", text)
    for q in q_matches:
        if len(objs) >= max_items:
            break
        title = q.strip()[:120]
        objs.append({
            "title": title,
            "text": q.strip(),
            "comments": [],
            "queries": [q.strip()],
            "tags": []
        })

    # if not enough, split into chunks of ~CHUNK_SIZE words and create summary objects
    if len(objs) < max_items:
        words = text.split()
        chunk_size = CHUNK_SIZE
        i = 0
        while i < len(words) and len(objs) < max_items:
            chunk = ' '.join(words[i:i+chunk_size]).strip()
            i += chunk_size
            if not chunk:
                continue
            # title: first sentence or first 80 chars
            first_sentence = re.split(r'[\.\n\?!]', chunk)[0].strip()
            title = (first_sentence[:120] or chunk[:120]).strip()
            # queries: any sentence in chunk that ends with a question mark
            queries = re.findall(r"([^\.\n]{10,}?\?)", chunk)
            objs.append({
                "title": title,
                "text": chunk[:800],
                "comments": [],
                "queries": [q.strip() for q in queries] if queries else [],
                "tags": []
            })

    # deduplicate by query/title and trim to max_items
    seen = set()
    final = []
    for o in objs:
        key = (o.get('title','').lower(), tuple(o.get('queries',[])))
        if key in seen:
            continue
        seen.add(key)
        final.append(o)
        if len(final) >= max_items:
            break
    return final


# Ask Gemini if key is available, otherwise use local heuristic
if key:
    print("Using Gemini model to generate structured array (key found)")
    response = client.models.generate_content(
        model="models/gemini-2.5-flash",
        config=types.GenerateContentConfig(
            system_instruction=(
                "You are a concise health assistant. Read the provided document text and return a JSON array (use only JSON) of up to 40 objects. Each object must have the fields:\n"
                "{\n  \"title\": \"relevant title\",\n  \"text\": \"short summary\",\n  \"comments\": [\"short tips or answers\"],\n  \"queries\": [\"main concern or question\"],\n  \"tags\": [\"comma-separated tags\"]\n}\n"
                "Scan the whole text and extract distinct queries/items; return as an array with no explanatory text. Keep fields short and useful. Return at most 40 items."
            ),
            temperature=0.2,
            response_mime_type="application/json",
        ),
        contents=text
    )
    # parse response
    json_data = extract_json(response.text)
    if json_data is None:
        print("⚠️ Failed to parse JSON from Gemini response — falling back to local extractor")
        json_data = generate_local_objects(text, max_items=MAX_ITEMS)
    else:
        # ensure it's a list and trim
        if isinstance(json_data, dict):
            # maybe model returned single object — wrap
            json_data = [json_data]
        if not isinstance(json_data, list):
            print("⚠️ Unexpected type from model; falling back to local extractor")
            json_data = generate_local_objects(text, max_items=MAX_ITEMS)
        else:
            if len(json_data) > MAX_ITEMS:
                json_data = json_data[:MAX_ITEMS]
else:
    print(f"No GEMINI_API_KEY found — using local heuristic extractor to create {OUTPUT_FILE}")
    json_data = generate_local_objects(text, max_items=MAX_ITEMS)

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    # Normalize fields: ensure tags and queries are arrays of individual strings
    def split_and_clean(value):
        """Turn a string or list into a deduplicated list of trimmed strings.

        Splits on commas, semicolons, and pipes. Preserves order.
        """
        parts = []
        if value is None:
            return parts
        if isinstance(value, list):
            iterable = value
        else:
            iterable = [value]
        for item in iterable:
            if not item:
                continue
            if not isinstance(item, str):
                item = str(item)
            # split by common separators
            for sub in re.split(r"[;,|]", item):
                s = sub.strip()
                if s:
                    parts.append(s)
        # deduplicate while preserving order
        seen = set()
        out = []
        for p in parts:
            lp = p.lower()
            if lp in seen:
                continue
            seen.add(lp)
            out.append(p)
        return out

    def ensure_list_of_strings(value):
        if value is None:
            return []
        if isinstance(value, list):
            return [str(x).strip() for x in value if str(x).strip()]
        return [str(value).strip()] if str(value).strip() else []

    if isinstance(json_data, list):
        for obj in json_data:
            if not isinstance(obj, dict):
                continue
            # ensure basic string fields
            obj['title'] = str(obj.get('title', '') or '').strip()
            obj['text'] = str(obj.get('text', '') or '').strip()

            # normalize tags and queries
            obj['tags'] = split_and_clean(obj.get('tags', []))
            obj['queries'] = split_and_clean(obj.get('queries', []))

            # normalize comments to list of short strings
            obj['comments'] = ensure_list_of_strings(obj.get('comments', []))

    json.dump(json_data, f, indent=2, ensure_ascii=False)

print(f"✅ {OUTPUT_FILE} created successfully ({len(json_data)} items)")
