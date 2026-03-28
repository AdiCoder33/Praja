# 🔊 Voice Setup Guide for Telugu & Hindi

## 🎯 Problem
Browser TTS (Text-to-Speech) may not have Telugu or Hindi voices installed by default.

---

## ✅ Solutions

### **Option 1: Windows Settings (Recommended)**

#### **For Telugu:**
1. Open **Settings** → **Time & Language** → **Language**
2. Click **"Add a language"**
3. Search for **"Telugu"** (తెలుగు)
4. Click **"Install"**
5. Wait for language pack to download
6. Restart browser

#### **For Hindi:**
1. Same steps but select **"Hindi"** (हिंदी)
2. Install language pack
3. Restart browser

---

### **Option 2: Chrome TTS Extension**

1. Install **"Read Aloud"** extension
2. Supports 40+ languages including Telugu & Hindi
3. Better quality than browser default

---

### **Option 3: Use Edge Browser**

Microsoft Edge has better Indian language support:
1. Open Edge
2. Go to `edge://settings/languages`
3. Add Telugu/Hindi
4. Enable text-to-speech
5. Restart Edge

---

### **Option 4: Google Cloud TTS (Production)**

For production deployment, use Google Cloud TTS API:
- Professional quality voices
- Native Telugu & Hindi speakers
- Costs: ~$4 per 1 million characters

---

## 🧪 Test Voice Support

Open browser console (F12) and run:
```javascript
speechSynthesis.getVoices().forEach(v =>
    console.log(v.name, '-', v.lang)
);
```

Look for:
- `te-IN` for Telugu
- `hi-IN` for Hindi
- `en-IN` for Indian English

---

## 📱 Current Browser Support

- ✅ **Chrome:** Good (with language packs)
- ✅ **Edge:** Best for Indian languages
- ⚠️ **Firefox:** Limited Indian language support
- ❌ **Safari:** Very limited

---

## 🎤 What Works Now

- **English:** ✅ Works on all browsers
- **Hindi:** ✅ Works if Hindi language pack installed
- **Telugu:** ✅ Works if Telugu language pack installed
- **Fallback:** Uses English voice if native voice not available

---

## 💡 Tip for Demo

If Telugu/Hindi voices aren't working:
1. The **text will still show in Telugu/Hindi** ✅
2. Voice will use **English** as fallback
3. User can read Telugu text on screen

For production, use **Google Cloud TTS API** for guaranteed voice support!
