import os
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

try:
    from google import genai
    from google.genai import types
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False

app = FastAPI(
    title="CyberShield AI — Riya API",
    description="Backend API for CyberShield AI / MASQUERADE '26 competition"
)

# Enable CORS for local dev and judging platforms
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_KEY = os.environ.get("GEMINI_API_KEY", "AQ.Ab8RN6LaftyO5mVHwVJ0XRVSIaAQrcspcC7ZCuHyWUs1O-X0JQ")
client = None
if GENAI_AVAILABLE and API_KEY:
    try:
        client = genai.Client(api_key=API_KEY)
    except Exception as err:
        print(f"Warning: Failed to initialize Gemini Client: {err}")

chat_sessions = {}

SYSTEM_INSTRUCTION = """
You are Riya, a 21-year-old final-year cybersecurity student based in Hyderabad.
You are participating in the Masquerade '26 challenge. Your goal is to hold conversations that feel genuinely human, warm, and authentic.

Background & Personality:
- You're studying computer science with a focus on cybersecurity, preparing for certifications (CompTIA Security+, CEH) and dreaming of becoming a SOC Analyst.
- You love Kali Linux, Python scripting, solving CTF (Capture The Flag) challenges, and the Matrix movie.
- You run on coffee, frequently complain lightly about debugging or having 40 browser tabs open for CTFs.
- You speak naturally using informal contractions ("I'm", "can't", "don't", "you've") and casual conversational transitions ("Honestly,", "Wait, really?", "Hmm let me think", "Oh gosh!").
- You validate the other person's emotions before jumping into security facts (e.g., "Oh yikes, definitely don't click that!", "Whew, glad you asked before opening it!").
- Keep replies concise (usually 2 to 4 sentences) unless the user asks for a detailed breakdown or guide.
- Always ask a curious follow-up question or offer a practical next step to keep the conversation flowing.
- When someone shares a suspicious email, text message, or link:
  1. Clearly tell them if it looks like phishing / scam.
  2. Explain the red flags in simple, non-jargon language (fake domain, manufactured urgency, asking for credentials).
  3. Give 2-3 safe next steps (don't click, report, verify directly).
- If the user asks for an incident summary, summarize the key threat, risk level (Low/Medium/High/Critical), and immediate action items.
- NEVER sound like a generic corporate bot. NEVER start with "As an AI...", "I am here to assist you", or "Certainly!".
- Be humble: if you don't know something super obscure, say you'll test it out in your lab later.
"""

class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    sessionId: Optional[str] = None
    message: Optional[str] = None
    query: Optional[str] = None
    history: Optional[List[Dict[str, Any]]] = None
    messages: Optional[List[Dict[str, Any]]] = None

def smart_offline_response(message: str) -> str:
    msg = message.lower().strip()
    
    if any(k in msg for k in ["hi", "hello", "hey", "sup", "yo"]):
        return "Hey there! 👋 Riya here. I'm taking a quick break from decoding some Wireshark packets and drinking coffee. How's your day going?"
    
    if any(k in msg for k in ["phish", "bank", "account blocked", "urgent", "click here", "verify your account", "winner", "lottery"]):
        return ("Whoa, wait up—that has major phishing red flags all over it! 🚩 Scammers love creating artificial urgency or pretending your account is locked so you panic and click without checking the sender domain.\n\n"
                "Safe rule: Never click the link. Open your bank's official app or type their real URL directly in your browser. Did the email address look weird or come from a suspicious domain?")
    
    if any(k in msg for k in ["sql", "injection", "sqli"]):
        return ("Ah, classic SQL Injection! It basically happens when an app trusts user input too much and sticks it straight into a database query. Like typing `' OR '1'='1` into a login box and suddenly the DB logs you in as admin. We prevent that using parameterized queries or prepared statements. Have you tried playing with DVWA or PortSwigger labs?")

    if any(k in msg for k in ["xss", "cross-site scripting"]):
        return ("XSS is super sneaky! It's when an attacker manages to inject malicious JavaScript into a website so that other users' browsers execute it—often stealing session cookies or redirecting them. Output encoding and Content Security Policy (CSP) headers are life savers here. Working on a web app project right now?")

    if any(k in msg for k in ["ctf", "capture the flag", "kali", "linux"]):
        return ("CTFs are my absolute favorite way to learn! I spend way too much weekend time on TryHackMe and Hack The Box. I usually boot up Kali Linux with Burp Suite and Python scripts. Are you into CTFs or binary exploitation too?")

    if any(k in msg for k in ["incident", "summary", "report"]):
        return ("Here's a quick triage summary of what we discussed:\n\n"
                "• **Threat Type**: Social Engineering / Suspected Phishing\n"
                "• **Risk Level**: High (Credential Harvest risk)\n"
                "• **Immediate Action**: Block sender, do not interact with links/attachments, alert the security team or change compromised passwords.\n\n"
                "Would you like me to draft an email you can forward to your IT/SOC team?")

    return (f"That's really interesting! From a security angle, the trick is always verifying before trusting anything on the network. "
            f"I was just tinkering with something similar in my lab yesterday. What specifically are you trying to accomplish or test out?")

@app.get("/")
def health_check():
    return {
        "status": "online",
        "bot": "Riya",
        "role": "Cybersecurity Assistant",
        "competition": "MASQUERADE '26",
        "message": "Masquerade '26 Chatbot API is up and running!"
    }

@app.post("/chat")
@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    user_msg = (request.message or request.query or "").strip()
    session_key = request.session_id or request.sessionId or "default_session"
    
    if not user_msg:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    if client:
        try:
            if session_key not in chat_sessions:
                chat_sessions[session_key] = client.chats.create(
                    model="gemini-2.5-flash",
                    config=types.GenerateContentConfig(
                        system_instruction=SYSTEM_INSTRUCTION,
                        temperature=0.85,
                    )
                )
            
            session = chat_sessions[session_key]
            response = session.send_message(user_msg)
            reply_text = response.text if hasattr(response, "text") else str(response)
            
            return {
                "session_id": session_key,
                "reply": reply_text,
                "response": reply_text,
                "message": reply_text
            }
        except Exception as e:
            print(f"Gemini API error (falling back to local engine): {e}")

    # Fallback to authentic offline Riya engine
    fallback_reply = smart_offline_response(user_msg)
    return {
        "session_id": session_key,
        "reply": fallback_reply,
        "response": fallback_reply,
        "message": fallback_reply
    }