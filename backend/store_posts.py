import praw
from google import genai
from google.genai import types
from pydantic import BaseModel
import os
from dotenv import load_dotenv
import json
import re

load_dotenv()
api_key=os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY environment variable is not set. Set it before running this script.")

# configure genai client once (used later for tag generation and optional comment classification)
try:
    genai.configure(api_key=api_key)
except Exception:
    # we'll try to configure again when needed; proceed with heuristics as fallback
    pass

reddit = praw.Reddit(
    client_id="7CVqi9skK46hl2-unW4TlQ",
    client_secret="MMHIVVIUPiBlhZcGzFpXpblOz4mUBg",
    user_agent="FoodApp by u/More-Relation"
)

subreddit = reddit.subreddit("IndianFood")

search_queries = ["diabetes", "anemia", "healthy", "hypertension", "PCOS", "low sugar", "nutrition"]

posts_data = []
seen_ids = set()

for query in search_queries:
    for post in subreddit.search(query, limit=20, sort='relevance'):
       
        if post.id in seen_ids:
            continue
        seen_ids.add(post.id)
        comments = []
        try:
            post.comments.replace_more(limit=0)
            comments_raw = [c.body for c in post.comments.list() if hasattr(c, "body")]
        except Exception:
            comments_raw = [getattr(c, "body", "") for c in post.comments if hasattr(c, "body")]

        # filter out very short, emoji-only, "thank you" style comments, questions, and context-less replies
        LLM_CALL_LIMIT = 40
        llm_state = {"calls": 0}

        def is_meaningful_comment(text: str) -> bool:
            if not text:
                return False
            s = text.strip()
            if not re.search(r"[A-Za-z0-9]", s):
                return False
            words = re.findall(r"\w+", s)
            word_count = len(words)
            # too short to be an insightful answer
            if word_count < 4:
                return False

            # simple "thanks" style messages
            if re.search(r"\b(thank|thanks|thx)\b", s, re.I) and word_count < 6:
                return False

            # drop comments that are clearly questions (user requested: exclude asking questions)
            if "?" in s:
                return False

            # drop common short reply-only phrases that don't stand alone
            reply_phrases = [r"^i agree\b", r"^same\b", r"^me too\b", r"^agree\b", r"^exactly\b", r"^yes\b", r"^no\b", r"^yep\b", r"^yeah\b"]
            for rp in reply_phrases:
                if re.search(rp, s, re.I):
                    return False

            # drop comments that look like they're talking to other commenters (mentions, reply chains, quoted back-and-forth)
            # examples: "@user", "u/username", "in response to", "as X said", lots of quoting (">"), or explicit reply phrases
            conversational_patterns = [
                r"^@\w+",               # direct @mentions at start
                r"\bu/\w+",            # reddit user mentions
                r"\br/\w+",            # reddit subreddit mentions (indicative of meta chat)
                r"\bin response to\b",
                r"\bin reply to\b",
                r"\bas .* said\b",
                r"\bwhat .* said\b",
                r"\bsee above\b",
                r"\bsee below\b",
                r"\bditto\b",
                r"\bsecond this\b",
                r"\bseconded\b",
                r"\bi second that\b",
                r"^>+",                  # quoted text lines
            ]
            for pat in conversational_patterns:
                if re.search(pat, s, re.I):
                    # allow short exception: if comment also contains clear advice/action verbs, keep it
                    if re.search(r"\b(recommend|try|avoid|reduce|increase|cook|recipe|eat|serve|substitute|replace|limit|consult|doctor|nutrition|should|must)\b", s, re.I):
                        break
                    return False

            return True


        def is_relevant_with_llm(title: str, body: str, comment: str) -> bool:
            """Return True if comment appears to answer/give advice relevant to the post title/body.
            Uses simple heuristics first and falls back to the LLM (Gemini) for borderline cases.
            """
            # use mutable state in outer scope so we can update count from here

            # If heuristics already reject, skip LLM
            if not is_meaningful_comment(comment):
                return False

            # Fast heuristics: presence of action/advice verbs or food/nutrition keywords
            advice_keywords = ["recommend", "try", "avoid", "reduce", "increase", "cook", "recipe", "eat", "serve", "substitute", "replace", "limit", "consult", "doctor", "nutrition"]
            kcount = sum(1 for k in advice_keywords if re.search(r"\b" + re.escape(k) + r"\b", comment, re.I))
            # if there are clear advice words, keep without LLM
            if kcount >= 1:
                return True

            # Limit LLM usage to avoid excessive calls and cost
            if llm_state.get("calls", 0) >= LLM_CALL_LIMIT:
                # fallback to heuristics-only decision
                return kcount >= 1

            # Construct a small classification prompt asking for KEEP or DROP
            prompt = (
                "You are a classifier that decides whether a Reddit comment is an actual answer/advice relevant to the post. "
                "Return ONLY the single word KEEP if the comment provides an answer or useful advice related to the post title/body; otherwise return DROP.\n\n"
                "Title: " + (title or "") + "\nBody: " + (body or "") + "\nComment: " + comment + "\n\nOutput: "
            )

            try:
                llm_state["calls"] = llm_state.get("calls", 0) + 1
                resp = genai.generate_text(model="text-bison-001", input=prompt)
                resp_text = None
                if hasattr(resp, "text"):
                    resp_text = resp.text
                elif hasattr(resp, "output"):
                    out = getattr(resp, "output")
                    if isinstance(out, (list, tuple)) and len(out) > 0 and hasattr(out[0], "content"):
                        resp_text = out[0].content
                    elif isinstance(out, str):
                        resp_text = out
                elif isinstance(resp, dict):
                    resp_text = resp.get("text") or resp.get("output")

                if resp_text and "KEEP" in resp_text.upper():
                    return True
                return False
            except Exception:
                # On error, fall back to heuristics
                return kcount >= 1


        # apply both heuristics and LLM-based relevance check
        comments = []
        for c in comments_raw:
            if is_relevant_with_llm(post.title or "", post.selftext or "", c):
                comments.append(c)

        # Skip posts that have no comments
        if not comments:
            continue

        # Build a simple matched queries list by scanning text for known query tokens
        content_lower = "\n".join([post.title or "", post.selftext or "", "\n".join(comments)]).lower()
        matched_queries = [q for q in search_queries if q.lower() in content_lower]
        # Ensure at least the original query is present
        if query not in matched_queries:
            matched_queries.insert(0, query)

        # Prepare LLM prompt to generate optional tags. We prefer a JSON array of short tag strings.
        prompt = (
            "You are a tag generator. Given a post (title, body and comments) and a list of candidate tags, "
            "return a JSON array (only the array) of up to 6 tag strings that best describe the post. "
            "Prefer tags from the candidate list but you may add 1-2 related tags if relevant. "
            "If unsure, return the candidate tags that appear in the post.\n\n"
            "Candidates: " + ", ".join(search_queries) + "\n\n"
            "POST:\nTitle: " + (post.title or "") + "\n\nBody: " + (post.selftext or "") + "\n\nComments:\n" + "\n---\n".join(comments)
        )

        tags = []
        # Try to call Gemini LLM to generate tags. Fall back to keyword tags on any failure.
        try:
            # Configure genai client (assumes GEMINI API key in GEMINI_API_KEY env)
            genai.configure(api_key=api_key)
            # Attempt a text generation. The exact client signature may vary by genai version; this is a best-effort call.
            resp = genai.generate_text(model="text-bison-001", input=prompt)
            # Extract text from the response in a few common shapes
            resp_text = None
            if hasattr(resp, "text"):
                resp_text = resp.text
            elif hasattr(resp, "output"):
                # Some clients return an output list
                out = getattr(resp, "output")
                if isinstance(out, (list, tuple)) and len(out) > 0 and hasattr(out[0], "content"):
                    resp_text = out[0].content
                elif isinstance(out, str):
                    resp_text = out
            elif isinstance(resp, dict):
                # fallback for dict-shaped responses
                resp_text = resp.get("text") or resp.get("output")

            if resp_text:
                # try to find a JSON array inside the response
                import re, json as _json

                m = re.search(r"(\[.*\])", resp_text, flags=re.S)
                if m:
                    try:
                        tags = _json.loads(m.group(1))
                        # ensure we have strings
                        tags = [str(t).strip() for t in tags if t]
                    except Exception:
                        tags = []
        except Exception:
            tags = []

        # Final fallback: keyword-based tags (include matched queries)
        if not tags:
            # start from matched queries and include a couple of heuristics
            tags = matched_queries.copy()
            # simple heuristics: look for words indicating low-carb / low-sugar / diet related
            heuristics = {
                "low sugar": ["low sugar", "sugar free", "sugar-free"],
                "healthy": ["healthy", "weight loss", "low carb", "low-carb"],
            }
            for tagname, terms in heuristics.items():
                for t in terms:
                    if t in content_lower and tagname not in tags:
                        tags.append(tagname)

        posts_data.append({
            "title": post.title,
            "text": post.selftext,
            "comments": comments,
            "queries": matched_queries,
            "tags": tags,
        })

with open("posts_data.json", "w", encoding="utf-8") as f:
    json.dump(posts_data, f, ensure_ascii=False, indent=2)