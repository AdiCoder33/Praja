# AI Voice FIR Assistant 🚔

Real-time voice-based FIR (First Information Report) filing system using Gemini AI.

## Features

✅ **Real-time voice chat** - Speak and see text instantly
✅ **AI-powered conversation** - Natural FIR data collection
✅ **Multi-language support** - English, Hindi, Telugu
✅ **Voice responses** - AI speaks back to user
✅ **Beautiful UI** - Clean chat interface

## Setup Instructions

### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 2. Setup API Key

1. Copy `.env.example` to `.env`:
```bash
copy .env.example .env
```

2. Add your Gemini API key in `.env`:
```
GEMINI_API_KEY=your_actual_api_key_here
```

### 3. Run the Server

```bash
python server.py
```

Server will start on `http://localhost:5000`

### 4. Open the Frontend

Open `index.html` in your browser (Chrome or Edge recommended)

Or use a simple HTTP server:
```bash
python -m http.server 8000
```

Then visit: `http://localhost:8000`

## How to Use

1. **Click the microphone button** 🎤
2. **Speak your complaint** in English/Hindi/Telugu
3. **See your speech as text** appear instantly
4. **AI responds** with follow-up questions
5. **AI speaks back** the response

## Architecture

```
User Voice → Browser Speech API (STT) → Display in Chat
                                       ↓
                              Python Flask Server
                                       ↓
                              Gemini 2.0 Flash API
                                       ↓
                              AI Response Text
                                       ↓
                              Display in Chat → Browser TTS (AI speaks)
```

## Requirements

- Python 3.8+
- Modern browser (Chrome/Edge) for speech recognition
- Gemini API key (free tier)
- Internet connection

## API Endpoints

- `POST /api/chat` - Send message to AI
- `GET /health` - Health check

## Technologies Used

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Python Flask
- **AI:** Google Gemini 2.0 Flash
- **Speech:** Web Speech API (browser-based)

## Notes

- Telugu support depends on browser's speech recognition capabilities
- Works best in Chrome/Edge browsers
- Requires microphone permissions
- Free tier Gemini API: 15 requests/minute

## Troubleshooting

**Microphone not working:**
- Allow microphone permissions in browser
- Use Chrome or Edge browser

**Server error:**
- Check if `GEMINI_API_KEY` is set in `.env`
- Verify API key is valid
- Check internet connection

**No speech recognition:**
- Use Chrome or Edge (Safari not fully supported)
- Check microphone is connected
