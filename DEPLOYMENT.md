# 🚀 Deployment Guide — CyberShield AI (MASQUERADE '26)

This guide walks you through deploying **CyberShield AI (Riya)** for the **MASQUERADE '26** hackathon evaluation and general public access.

---

## 🎯 Architecture Overview

```text
┌─────────────────────────┐               ┌─────────────────────────┐
│     Vercel Frontend     │  POST /chat   │      Render Backend     │
│  (React 19 + Cyber UI)  ├──────────────►│    (FastAPI + Gemini)   │
│  https://...vercel.app  │               │ https://...onrender.com │
└─────────────────────────┘               └───────────┬─────────────┘
                                                      │
                                                      ▼
                                           ┌────────────────────┐
                                           │  Google Gemini API │
                                           │  (gemini-2.5-flash)│
                                           └────────────────────┘
```

---

## 🌟 Option 1: Render (Backend) + Vercel (Frontend) — Recommended

This is the fastest, cleanest, and most reliable setup for hackathons.

### Part A: Deploy Backend on Render (Free)

1. Sign in to [Render](https://render.com/).
2. Click **New +** ➔ **Web Service**.
3. Select **Build and deploy from a Git repository** and connect:
   `https://github.com/chidekpattanaik/cyber-buddy-ai-98`
4. Fill in the service configuration:
   - **Name:** `cybershield-backend` (or your choice)
   - **Region:** Any (e.g., Singapore or Oregon)
   - **Branch:** `main`
   - **Runtime:** `Python 3`
   - **Build Command:**
     ```bash
     pip install -r requirements.txt
     ```
   - **Start Command:**
     ```bash
     uvicorn main:app --host 0.0.0.0 --port $PORT
     ```
   - **Plan:** `Free`
5. Under **Environment Variables**, add:
   - `GEMINI_API_KEY`: *(Your Google Gemini API key from https://aistudio.google.com/app/apikey)*
   - `PYTHON_VERSION`: `3.11.9`
6. Click **Deploy Web Service**.
7. Once deployed, note down your public URL:
   - Base URL: `https://cybershield-backend.onrender.com`
   - **Competition Submission Endpoint:** `https://cybershield-backend.onrender.com/chat`

---

### Part B: Deploy Frontend on Vercel (Free)

1. Sign in to [Vercel](https://vercel.com/).
2. Click **Add New…** ➔ **Project**.
3. Import your GitHub repository: `cyber-buddy-ai-98`.
4. Configure Project Settings:
   - **Framework Preset:** `Other` (or leave default Vite)
   - **Build Command:** `npm run build`
   - **Output Directory:** `.output/public`
5. Under **Environment Variables**, add:
   - **Name:** `VITE_BACKEND_URL`
   - **Value:** `https://your-backend-name.onrender.com/chat` *(URL from Part A)*
6. Click **Deploy**.
7. Vercel will build and assign you a live domain (e.g., `https://cyber-buddy-ai-98.vercel.app`).

---

## 📦 Option 2: 1-Click Render Blueprint (Full-Stack)

The repository includes a ready-to-use [`render.yaml`](./render.yaml) file:

1. In Render, click **Blueprints** ➔ **New Blueprint Instance**.
2. Connect this repository.
3. Render automatically provisions:
   - `cybershield-backend` (FastAPI Web Service)
   - `cybershield-frontend` (Static Site connected to the backend)
4. Enter your `GEMINI_API_KEY` when prompted and click **Apply**.

---

## 🐳 Option 3: Docker Deployment

To run both services in containers with a single command:

```bash
# 1. Set your Gemini API key (optional)
export GEMINI_API_KEY="your-api-key"

# 2. Build and start containers
docker compose up --build
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`

---

## 🧪 Validating Your Endpoint Before Submission

Before submitting the endpoint in the **MASQUERADE '26** Google Form, run these tests:

### 1. Health Check Test
```bash
curl https://your-backend.onrender.com/
```
**Expected Response:**
```json
{
  "status": "online",
  "bot": "Riya",
  "role": "Cybersecurity Assistant",
  "competition": "MASQUERADE '26"
}
```

### 2. Chat Query Test
```bash
curl -X POST https://your-backend.onrender.com/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I got an email saying my bank account is blocked.",
    "session_id": "test_session_1"
  }'
```
**Expected Response:**
```json
{
  "session_id": "test_session_1",
  "reply": "🚩 Warning: That looks like a Phishing attempt!...",
  "response": "🚩 Warning: That looks like a Phishing attempt!..."
}
```

---

## 📋 MASQUERADE '26 Submission Checklist

- [x] Backend responds to `GET /` with 200 OK.
- [x] Backend accepts `POST /chat` with `{"message": "...", "session_id": "..."}`.
- [x] Response includes `reply` and `response` keys.
- [x] CORS headers (`Access-Control-Allow-Origin: *`) are active so judges can interact through their platform.
- [x] Persona matches **Riya** (21-year-old student from Hyderabad, cybersecurity focus, natural conversational flow).
- [x] Working chat interface running at live URL or local machine during evaluation.
