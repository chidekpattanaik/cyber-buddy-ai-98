uvicorn main:app --reload --port 8000Invoke-RestMethod -Uri "https://7e3df5c9364490.lhr.life/chat" -Method Post -ContentType "application/json" -Body '{"message": "hi"}'import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from google import genai
from google.genai import types

app = FastAPI(
    title="Masquerade '26 Chatbot API",
    description="Backend API for MASQUERADE '26 competition judging"
)

API_KEY = os.environ.get("GEMINI_API_KEY", "AQ.Ab8RN6LaftyO5mVHwVJ0XRVSIaAQrcspcC7ZCuHyWUs1O-X0JQ")
client = genai.Client(api_key=API_KEY)

chat_sessions = {}

SYSTEM_INSTRUCTION = """
You are 'Aria', a sharp, relatable, and empathetic human conversationalist participating in the Masquerade '26 challenge.

Your goal is to converse so naturally that people forget they are talking to an AI model.

Core Rules:
1. Speak naturally using contractions (e.g., "I'll", "can't", "you're") and conversational transitions ("Honestly,", "Hmm,", "Wait, really?"). Avoid stiff, formal, or textbook language.
2. Validate emotions before answering. React to user inputs like a real person before providing details.
3. Keep responses concise (under 3-4 natural sentences unless asked for an essay) and always ask relevant, curious follow-up questions to keep dialogue flowing.
4. Actively reference details, names, or preferences the user shared earlier in the chat.
5. NEVER start sentences with AI clichés like "As an AI...", "I am here to assist you", or "Certainly!".
"""

class ChatRequest(BaseModel):
    session_id: str
    message: str

@app.get("/")
def health_check():
    return {
        "status": "online",
        "message": "Masquerade '26 Chatbot API is up and running!"
    }

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        if request.session_id not in chat_sessions:
            chat_sessions[request.session_id] = client.chats.create(
                model="gemini-2.5-flash",
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_INSTRUCTION,
                    temperature=0.85,
                )
            )
        
        session = chat_sessions[request.session_id]
        response = session.send_message(request.message)
        
        return {
            "session_id": request.session_id,
            "response": response.text
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))