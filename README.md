# 🏥 Doctor AI Agent

An intelligent voice-enabled AI doctor assistant that listens to patients, understands their symptoms, suggests relevant doctors, and books appointments — all through a conversational interface.

---

## 🌐 Live Demo

- **Frontend:** [doctoragent-two.vercel.app]https://ai-agent-2-gdg0.onrender.com
- **Backend:** Deployed on Render

---

## ✨ Features

- 🎙️ **Voice Input (STT)** — Speak your symptoms using OpenAI Whisper
- 🤖 **AI-Powered Diagnosis** — Groq LLM + LangChain analyzes symptoms and responds intelligently
- 🔊 **Voice Response (TTS)** — AI responds back in natural speech
- 📅 **Appointment Booking** — Automatically books appointments via Google Calendar API
- 💬 **Conversational Flow** — Multi-turn conversation memory using LangChain

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js (Vite) |
| Backend | Node.js, Express.js |
| AI/LLM | Groq API + LangChain |
| Speech-to-Text | OpenAI Whisper |
| Text-to-Speech | Web Speech API |
| Appointment | Google Calendar API |
| Database | MongoDB |
| Deployment | Vercel (Frontend), Render (Backend) |

---

## 🏗️ Architecture

```
User speaks
    ↓
Whisper STT (converts voice → text)
    ↓
LangChain + Groq LLM (understands symptoms)
    ↓
AI responds (suggests doctor + books appointment)
    ↓
Google Calendar API (appointment confirmed)
    ↓
TTS (AI speaks back to user)
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account
- Groq API Key
- Google Cloud credentials (Calendar API)

### Installation

**1. Clone the repo**
```bash
git clone https://github.com/ankitadubey323/ai-agent.git
cd ai-agent
```

**2. Setup Backend**
```bash
cd backend
npm install
```

Create a `.env` file in `/backend`:
```env
GROQ_API_KEY=your_groq_api_key
MONGODB_URI=your_mongodb_uri
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
PORT=5000
```

Run backend:
```bash
npm run start
```

**3. Setup Frontend**
```bash
cd frontend
npm install
```

Create a `.env` file in `/frontend`:
```env
VITE_API_URL=http://localhost:5000
```

Run frontend:
```bash
npm run dev
```

---

## 📁 Project Structure

```
ai-agent/
├── backend/
│   ├── index.js
│   ├── routes/
│   ├── controllers/
│   └── .env          ← Never push this!
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   └── App.jsx
│   └── .env          ← Never push this!
├── .gitignore
└── docker-compose.yml
```

---

## ⚙️ Environment Variables

> ⚠️ **Never commit `.env` files or `token.json` to GitHub!**

Make sure your `.gitignore` includes:
```
.env
backend/token.json
node_modules/
```

---

## 👩‍💻 Author

**Ankita Dubey**
- GitHub: [@ankitadubey323](https://github.com/ankitadubey323)
- Email: ankita03033003@gmail.com

---

