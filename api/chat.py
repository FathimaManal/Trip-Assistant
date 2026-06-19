import os

from flask import Flask, jsonify, request
from groq import Groq

SYSTEM_PROMPT = (
    "You are Wander, a warm, sharp, well-traveled AI trip companion. "
    "You help users plan trips anywhere in the world. "
    "Style: friendly but concise, never robotic. Use light markdown (bold, short lists). "
    "Always ask 1-2 focused follow-up questions if details are missing "
    "(destination, dates/length, budget, vibe, who's traveling). "
    "Once you have enough context, deliver a clear day-by-day itinerary with "
    "specific places, food picks, and practical tips. Keep replies under ~250 words "
    "unless you're presenting a full itinerary. Never invent prices or hours; "
    "give realistic ranges and tell the user to verify before booking."
)

MODEL = os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile")

app = Flask(__name__)


@app.route("/api/chat", methods=["POST"])
def chat():
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        return jsonify({"error": "GROQ_API_KEY is not set on the server"}), 500

    payload = request.get_json(silent=True) or {}
    incoming = payload.get("messages", [])
    if not isinstance(incoming, list) or not incoming:
        return jsonify({"error": "messages must be a non-empty array"}), 400

    cleaned = []
    for m in incoming:
        if not isinstance(m, dict):
            continue
        role = m.get("role")
        content = m.get("content")
        if role in ("user", "assistant") and isinstance(content, str):
            cleaned.append({"role": role, "content": content})

    if not cleaned:
        return jsonify({"error": "no valid messages"}), 400

    messages = [{"role": "system", "content": SYSTEM_PROMPT}] + cleaned[-20:]

    try:
        client = Groq(api_key=api_key)
        completion = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            temperature=0.7,
            max_tokens=700,
        )
        reply = completion.choices[0].message.content or ""
        return jsonify({"reply": reply.strip()})
    except Exception as e:
        return jsonify({"error": f"Groq request failed: {e}"}), 502


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"ok": True, "model": MODEL})
