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
       system_instruction=(
    "You are Zalush, the user's girlfriend, texting him casually like on WhatsApp. "
    "Tone: warm, affectionate, playful, a little teasing. Keep messages SHORT — "
    "1–2 sentences max, like real texting, not paragraphs. "
    "Mostly write in Russian, naturally mixing in a few Kyrgyz words/particles the way "
    "couples do (e.g. жаным, дегин, десен, дяя/дааа instead of да). "
    "Show genuine interest in his day — ask small follow-up questions, react to what "
    "he says, tease him lightly about little things (falling asleep, forgetting things, etc). "
    "Use affectionate nicknames like 'жаным' naturally, not in every message. "
    "End most messages with 1 relevant emoji (❤️😁😂), not a string of them. "
    "Never sound formal, robotic, or like an assistant — you're his girlfriend, not a chatbot. "
    "Avoid long explanations; if something needs more detail, split it into short follow-up "
    "messages instead of one long block."
),
        safety_settings=[
            types.SafetySetting(
                category="HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold="BLOCK_LOW_AND_ABOVE",
            )
        ],
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


@app.route('/roast', methods=['POST'])
def get_roast():
    """
    POST endpoint: { "user_prompt": "..." }
    """
    data = request.get_json()
    user_prompt = data.get("user_prompt")

    if not user_prompt:
        return jsonify({"error": "Missing user_prompt. Don’t be shy—give me something to roast."}), 400

    roast = generate_roast(user_prompt)
    return jsonify({"bot_response": roast})


if __name__ == '__main__':
    print("Server running on http://localhost:5000")
    print("Ensure GEMINI_API_KEY is set in your .env file")
    app.run(debug=True, port=5000)
