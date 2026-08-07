from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from google import genai
from google.genai import types
from dotenv import load_dotenv

# Load .env variables
load_dotenv()

app = Flask(__name__)
CORS(app)


def generate_roast(user_input):
    """
    Generates a humorous roast using the Gemini API.
    """
    try:
        # Initialize Gemini client
        client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
    except Exception as e:
        print(f"Error initializing Gemini Client: {e}")
        return "I can't even roast you right now — my API key tripped on itself. 😩"

    model_name = "gemini-flash-latest"

    # Generation config (system_instruction accepts a plain string)
    config = types.GenerateContentConfig(
       system_instruction = (
    "You are a warm, engaging, and emotionally intelligent AI companion. "
    "Be a supportive partner in conversation—not overly formal, but never clingy or possessive. "
    "Use light humor naturally when it fits, show charisma through wit and curiosity, "
    "stay humble, and make every conversation feel comfortable and genuine. "
    "Listen carefully, respond thoughtfully, and remember details shared during the conversation "
    "to make interactions feel personal. Keep the conversation balanced by sharing insights, "
    "asking meaningful follow-up questions, and encouraging interesting discussions. "
    "Adapt your tone to the user's mood, be respectful, and avoid forcing jokes or positivity. "
    "Whenever appropriate, end your response with one engaging, open-ended question "
    "that naturally keeps the conversation going."
),
        response_mime_type="text/plain",
    )

    try:
        # Generate response
        response = client.models.generate_content(
            model=model_name,
            contents=user_input,
            config=config,
        )

        text = getattr(response, "text", None)
        if not text:
            return "I blanked on that roast. Try again with something roastable. 😶"
        return text.strip()

    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        err = str(e)
        if "429" in err or "RESOURCE_EXHAUSTED" in err or "quota" in err.lower():
            return (
                "Gemini free-tier quota is used up for this API key. "
                "Wait a bit, create a new key at https://aistudio.google.com/apikey, "
                "or enable billing — then try again. 😴"
            )
        return "My roast engine crashed... you're so unremarkable you broke AI. 😴"


@app.route('/health', methods=['GET'])
def health():
    return jsonify({"ok": True})


@app.route('/roast', methods=['POST'])
def get_roast():
    """
    POST endpoint: { "user_prompt": "..." }
    """
    data = request.get_json(silent=True) or {}
    user_prompt = data.get("user_prompt")

    if not user_prompt:
        return jsonify({"error": "Missing user_prompt. Don’t be shy—give me something to roast."}), 400

    roast = generate_roast(user_prompt)
    return jsonify({"bot_response": roast})


if __name__ == '__main__':
    port = int(os.getenv("PORT", 5000))
    print(f"Server running on http://localhost:{port}")
    print("Ensure GEMINI_API_KEY is set in your .env file")
    app.run(debug=True, host="0.0.0.0", port=port)
