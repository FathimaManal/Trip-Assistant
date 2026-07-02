# Wander - AI Trip Companion

A travel-planning chat app powered by **Groq + Llama 3.3**. Ask it anything from "5 days in Tokyo, foodie, $1500" to "honeymoon ideas in the Maldives" and it asks the right follow-up questions, then builds a day-by-day itinerary.

## Stack

- **Frontend:** Vite + React + TypeScript + Tailwind CSS v4
- **Backend:** Python Flask serverless functions on Vercel
- **LLM:** Groq (`llama-3.3-70b-versatile` by default)

## Run locally

```bash
npm install
cp .env.example .env   # then add your GROQ_API_KEY
vercel dev             # runs both the Vite frontend and the Flask /api function
```
Live Link : https://trip-assistant-inky.vercel.app

