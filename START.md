# 🚀 Quick Start Guide - AI Voice FIR Assistant

## ⚡ Start the Servers

### 1. Start Backend (Terminal 1)
```bash
python server.py
```

### 2. Start Frontend (Terminal 2)
```bash
python https_server.py
```

### 3. Open Browser
```
https://localhost:8443/index.html
```

---

## 🔒 Accept Certificate Warning (One Time)

- Click **"Advanced"**
- Click **"Proceed to localhost (unsafe)"**

---

## 🎤 Test Voice Input

1. Click the **🎤 microphone button**
2. Click **"Allow"** for microphone access
3. Speak: **"I lost my mobile phone"**
4. AI will respond with questions!

---

## ✅ Features

- 🎤 **Voice Input** - Speak naturally in English/Hindi/Telugu
- 💬 **Text Input** - Type your message
- 🔊 **Voice Output** - AI speaks responses
- 🤖 **Smart FIR Questions** - Intelligent data collection

---

## 🔑 API Key

Make sure your `.env` file has:
```
GEMINI_API_KEY=your_actual_key_here
```

---

## 📝 For Demo

**Type these test messages:**
1. `I lost my mobile phone`
2. `Someone stole my wallet`
3. `I was victim of cyber fraud`

AI will ask relevant follow-up questions!

---

## 🌐 URLs

- Frontend: https://localhost:8443
- Backend API: https://localhost:5000
- Health Check: https://localhost:5000/health

---

**Voice input works with HTTPS!** 🎉
