# Cyber Riya

HIi, we r working for a frontend in hackathon, its like we have to make a chatbot, and we selected a cybersecutity theme, so its like 
Hello Participants,

To help you prepare for MASQUERADE '26, we are sharing two important documents. We strongly recommend reading both before you begin building your chatbot.

Document 1: Participant deployment Overview

This document provides guidance on the overall challenge and includes:

The objective of the competition.

Different approaches you can take to build your chatbot.

Suggestions for creating a more natural and human-like conversational experience.

What judges will focus on during evaluation.

Guidance if you encounter deployment or endpoint submission issues.

This document is intended to give you direction and ideas, not a fixed solution.

Document 2: Participant Endpoint Submission Guide

This document explains the technical requirements for submitting your chatbot for evaluation. It covers:

How your endpoint should be structured.

The required API format.

How to test your endpoint before submission.

Details required in the submission form.

Common mistakes to avoid.

Please read this guide carefully before submitting your endpoint.

Important Note

We recommend deploying your chatbot and submitting its endpoint, as this enables judges to evaluate your chatbot directly through our judging platform. This ensures a smooth and consistent evaluation experience.

If you face genuine deployment or endpoint submission issues despite your best efforts, you may still complete your application and demonstrate a fully functional chatbot running locally on your laptop with a working chat interface during evaluation.

There are no restrictions on the technology stack, programming language, framework, or AI model you choose. You are free to use any approach that best suits your solution. The primary objective is to build a chatbot that delivers an engaging, intelligent, and human-like conversation experience.

If you have any questions after reading the documents, feel free to ask in the group. We wish you all the best for MASQUERADE '26.
This is the question you should answer before writing a single line of code.

For your hackathon, you are not building an AI model.

You are building an AI application.

What exactly are you building?

You are building CyberShield AI — a chatbot that behaves like a human cybersecurity expert.

Imagine the judge opens your website.

They see:

------------------------------------

🛡️ CyberShield AI

Hi! I'm Riya 👋

Your Cybersecurity Assistant.

How can I help you today?

[ Type your message... ]

------------------------------------

The judge types:

I got this email saying my bank account is blocked.

Your chatbot replies:

That definitely sounds suspicious. Could you paste the email or tell me whether it asked you to click a link or enter your password?

The judge pastes the email.

Your chatbot then:

Analyzes it.

Says whether it's phishing.

Explains why.

Gives safety advice.

That entire experience is your project.

What components are you building?

1. Frontend (Website)

This is what the user sees.

It includes:

Chat screen

Send button

Message bubbles

Typing animation

Dark cybersecurity theme

2. Backend

This is the server.

Its job is:

Receive the user's message.

Send it to the AI model.

Get the response.

Return it to the website.

3. AI Brain

You don't build this.

You use an existing model like:

OpenAI GPT

Google Gemini

Groq + Llama

4. Your Cybersecurity Logic

This is where your project becomes unique.

For example:

If the user pastes:

Dear Customer,

Your account has been blocked.

Click here:

bank-login-security.xyz

Your application recognizes this as a phishing analysis request and asks the AI to:

Identify suspicious language.

Explain the warning signs.

Assign a risk level.

Suggest safe next steps.

This is your application's logic built around the AI.

Your project architecture

           User

             │

             ▼

     Chat Website (Frontend)

             │

             ▼

     Node.js Backend (API)

             │

             ▼

        AI Model (GPT/Gemini)

             │

             ▼

     CyberShield Response

Your folder structure could look like this

cybershield-ai/

│

├── public/

│   ├── index.html

│   ├── style.css

│   └── app.js

│

├── server.js

├── package.json

├── .env

└── README.md

What makes your project different from a normal chatbot?

Instead of answering everything generally, it specializes in cybersecurity.

It can:

🛡️ Detect phishing emails or messages.

🔐 Explain cyber attacks in simple language.

💡 Answer cybersecurity questions naturally.

📋 Generate a short incident summary after helping the user.

💬 Hold a human-like conversation by asking follow-up questions.

If I were your mentor, I would tell you to build only these 5 things in one day:

💬 A clean chat interface.

🤖 Connect it to an AI model (OpenAI or Gemini).

🛡️ Give the AI a cybersecurity-focused system prompt so it behaves like a security analyst.

📧 Add phishing analysis (paste email/text → AI explains whether it's suspicious and why).

📝 Add an incident summary at the end of the conversation.

That's a realistic, complete project that demonstrates AI, cybersecurity, and good user experience without trying to build an AI model yourself.
Project Idea: CyberShield AI – Your Cybersecurity Assistant

Problem Statement

Many students and beginners struggle to understand cybersecurity concepts, identify threats, and respond to attacks. Existing resources are scattered and often too technical.

Solution

An AI chatbot that answers cybersecurity questions, analyzes suspicious content, explains attacks, and provides defensive guidance in real time.

9:50 PM

All participating teams will develop and deploy AI conversational systems designed to mimic human behavior. During the final evaluation, judges will interact with both a human and an AI without knowing which is which. Systems that successfully appear human will score higher.

Based on the statement, the judges are not testing cybersecurity knowledge. They're testing how human your AI feels.

So your strategy should be:

Build a believable character first, then make that character knowledgeable about cybersecurity.

A winning concept

🛡️ Character: "Riya – Cybersecurity Student"

Instead of acting like an expert who knows everything, make your bot:

A 21-year-old cybersecurity student

Preparing for certifications and CTFs

Loves Linux and coffee

Occasionally jokes about debugging

Curious and asks follow-up questions

This is more believable than pretending to be a senior ethical hacker.

Give your bot a life

Create a profile.

Name: Riya

Age: 21

Occupation: Final-year cybersecurity student

City: Hyderabad

Favourite language: Python

Favourite OS: Kali Linux

Favourite movie: The Matrix

Hobby: Solving CTF challenges

Dream: Become a SOC Analyst

These details make responses consistent.
For a team of 3, the best strategy is to divide responsibilities but collaborate on testing. Here's an ideal split:

👤 Member 1 – AI & Backend Lead

Responsibilities:

Integrate the AI model (Gemini/Groq/OpenAI API)

Write backend logic (Python, FastAPI/Flask)

Manage API calls and responses

Handle conversation memory

Optimize response speed

Tech Stack: Python, FastAPI/Flask, APIs

👤 Member 2 – Frontend & Deployment Lead

Responsibilities:

Design the chat interface

Build frontend (React or HTML/CSS/JavaScript)

Connect frontend with backend

Deploy the application

Ensure smooth user experience

Tech Stack: React, HTML, CSS, JavaScript, Vercel/Render

👤 Member 3 – Prompt Engineering & Testing Lead

Responsibilities:

Design the AI's personality

Create prompts and system instructions

Test with difficult questions

Fix unnatural responses

Prepare presentation and explain the project to judges

Skills: Prompt Engineering, QA Testing, Documentation

9:47 PM

Judges interact with both human participants and AI systems

Amreen Shaik

9:49 PM

Project Idea: CyberShield AI – Your Cybersecurity Assistant

Problem Statement

Many students and beginners struggle to understand cybersecurity concepts, identify threats, and respond to attacks. Existing resources are scattered and often too technical.

Solution

An AI chatbot that answers cybersecurity questions, analyzes suspicious content, explains attacks, and provides defensive guidance in real time.

9:50 PM

All participating teams will develop and deploy AI conversational systems designed to mimic human behavior. During the final evaluation, judges will interact with both a human and an AI without knowing which is which. Systems that successfully appear human will score higher.

9:53 PM

Five-digit prize money for winners

Amreen Shaik

9:55 PM

Based on the statement, the judges are not testing cybersecurity knowledge. They're testing how human your AI feels.

So your strategy should be:

Build a believable character first, then make that character knowledgeable about cybersecurity.

A winning concept

🛡️ Character: "Riya – Cybersecurity Student"

Instead of acting like an expert who knows everything, make your bot:

A 21-year-old cybersecurity student

Preparing for certifications and CTFs

Loves Linux and coffee

Occasionally jokes about debugging

Curious and asks follow-up questions

This is more believable than pretending to be a senior ethical hacker.

Give your bot a life

Create a profile.

Name: Riya

Age: 21

Occupation: Final-year cybersecurity student

City: Hyderabad

Favourite language: Python

Favourite OS: Kali Linux

Favourite movie: The Matrix

Hobby: Solving CTF challenges

Dream: Become a SOC Analyst

These details make responses consistent.

Amreen Shaik

9:56 PM

Extra features that impress judges

✅ Typing animation

✅ Human-like response delay

✅ Remembers previous messages

✅ Uses emojis occasionally (not excessively)

✅ Small jokes

✅ Follow-up questions

✅ Doesn't give perfect textbook answers every time

✅ Says "I'm not sure" when appropriate

✅ Consistent personality

Amreen Shaik

9:59 PM

Option 1: Modern Full Stack (Recommended ⭐⭐⭐⭐⭐)

Frontend

React.js (UI library)

Next.js (React framework)

Tailwind CSS (fast and responsive styling)

shadcn/ui (beautiful components)

Framer Motion (smooth animations)

Backend

FastAPI (Python)

Why?

Very fast to develop

Excellent for AI applications

Easy integration with LLMs

Automatic API documentation

AI

OpenAI API / Gemini API / Llama 3 (via Ollama or Groq)

Database

PostgreSQL (user data)

Redis (chat sessions, optional)

Memory

ChromaDB or FAISS (conversation memory/RAG)

Deployment

Frontend → Vercel

Backend → Render or Railway

Amreen Shaik

10:00 PM

Option 3: Python Only (Fastest for Hackathons)

Frontend

Streamlit

Backend

FastAPI

AI

GPT/Gemini/Llama

Very fast to build, but less polished than a React app.

human-ai-chatbot/

│

├── frontend/

│   ├── app/

│   ├── components/

│   ├── hooks/

│   ├── lib/

│   └── package.json

│

├── backend/

│   ├── main.py

│   ├── routes/

│   ├── services/

│   ├── prompts/

│   ├── memory/

│   ├── models/

│   ├── utils/

│   └── requirements.txt

│

├── database/

├── docs/

└── README.md

Amreen Shaik

10:01 PM

Features to Build

Human-like chat interface

Typing indicator

"Seen" status

Human-like response delays

Conversation memory

Personality profile

Emotion-aware replies

Voice input/output (optional)

Dark mode

Chat history

Chidek Pattanaik

10:02 PM

Afreen Fasiha's voice can be used, surely first prize for CODE NEXUS

i hope u understood how we plan so we want just frontend, backend is ready

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://cyber-buddy-ai-98.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f368bb78-4712-4ba7-bec9-71c4ee1c478d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
