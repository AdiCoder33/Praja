# 🇮🇳 Praja – AI Voice FIR Assistant

Built by Team **RGUKT_WARRIORS** for the **AI X Anantapur Hackathon 2k26**. AI voice assistant to file FIRs (First Information Reports) with strong Indian language support (Telugu, Hindi, English). Backend runs on Flask; frontend is Vite/React. Sarvam AI powers chat + TTS; Groq is used for summaries/translations.

## ✨ Features
- Voice + text chat in Telugu/Hindi/English with Sarvam LLM
- Natural Indian TTS (Sarvam) with auto fallback to gTTS
- FIR PDF generation from conversation history
- 4-second pause detection and continuous conversation mode
- Dashboard pages for complaints, insights, and officer view

## 🧱 Tech Stack
- Backend: Flask, Gunicorn (prod), Sarvam AI SDK, gTTS
- Frontend: Vite + React + TypeScript
- AI: Sarvam (chat + TTS), Groq (summaries/translations)

## 📁 Structure (top-level)
```
ai/            # AI providers (Sarvam)
backend/       # Flask API + routes/services
config/        # .env (gitignored), certs
docs/          # Setup guides
frontend/      # Vite/React app
```

## 🔑 Environment Variables
Copy `config/.env.example` to `config/.env` (backend) and set:
- `SARVAM_API_KEY` – required for Sarvam chat/TTS
- `GROQ_API_KEY` – required for Groq summaries/translations

Frontend (Vercel/local `.env`):
- `VITE_API_BASE` – backend base URL (e.g., https://your-backend.onrender.com). Leave blank for relative `/api` in local dev proxy.
- `VITE_GROQ_API_KEY` – optional; enables Groq features client-side.

## 🖥️ Local Development
Prereqs: Python 3.10+, Node 18+, npm, pip.

### Backend
```bash
cd backend
python -m venv .venv
.venv/Scripts/activate        # Windows
pip install -r requirements.txt
python server.py              # serves API at https://localhost:5000
```
Health: https://localhost:5000/health

### Frontend
```bash
cd frontend
npm install
# create .env.local with VITE_API_BASE=http://localhost:5000 (or leave blank to use proxy)
npm run dev                   # http://localhost:5173
```
Build: `npm run build` (outputs `dist/`)

## 🚀 Deployment
### Backend on Render
- Root: repo root
- Build: `cd backend && pip install -r requirements.txt`
- Start: `cd backend && gunicorn server:app --bind 0.0.0.0:$PORT`
- Env: `SARVAM_API_KEY`, `GROQ_API_KEY`

### Frontend on Vercel
- Set `VITE_API_BASE` to Render backend URL
- Set `VITE_GROQ_API_KEY` if using Groq in-browser
- Build command: `npm run build`; output: `dist`

## 🔌 API Endpoints (backend)
- POST `/api/chat` – chat + optional TTS
- POST `/api/fir/generate` – build FIR PDF from history
- GET `/api/fir/download/<filename>` – fetch generated PDF
- GET `/health` – health check

## 🧪 Diagnostics
- Sarvam check: `cd backend && python test_sarvam.py` (verifies key, SDK, chat, TTS)
- Frontend build: `cd frontend && npm run build`

## 📚 Docs
- Sarvam setup: [docs/SARVAM_SETUP.md](docs/SARVAM_SETUP.md)
- Conversation mode: [docs/CONVERSATION_MODE.md](docs/CONVERSATION_MODE.md)
- Pause detection: [docs/PAUSE_DETECTION.md](docs/PAUSE_DETECTION.md)

---
Made in India 🇮🇳 • Powered by Sarvam AI
