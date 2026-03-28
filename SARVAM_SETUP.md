# 🇮🇳 Sarvam AI Setup Guide

## 🎯 Why Sarvam AI?

Sarvam AI is **India's own AI** company with **best-in-class support** for Indian languages!

### **Benefits:**
- ✅ **10+ Indian languages:** Telugu, Hindi, Tamil, Kannada, Malayalam, Bengali, Gujarati, Marathi, Punjabi, Odia
- ✅ **Native pronunciation:** Better than Google TTS
- ✅ **Natural voices:** 45+ voices (Kavya, Anushka, Vidya, Abhilash, Rahul, etc.)
- ✅ **Free tier available**
- ✅ **Made in India** 🇮🇳

---

## 🚀 Setup Steps

### **1. Get API Key**

Visit: https://www.sarvam.ai

1. Click **"Get Started"** or **"Sign Up"**
2. Create account (free)
3. Go to **Dashboard** → **API Keys**
4. Copy your **API Key**

### **2. Add to `.env` file**

```env
GEMINI_API_KEY=your_gemini_key_here
SARVAM_API_KEY=your_sarvam_key_here
```

### **3. Install Dependencies**

```bash
pip install sarvamai requests
```

### **4. Restart Server**

```bash
python server.py
```

You'll see:
```
✅ Using Sarvam AI for TTS (Better Indian language support!)
```

---

## 🎤 Supported Languages

| Language | Code | Voice Quality |
|----------|------|---------------|
| Telugu | te-IN | ⭐⭐⭐⭐⭐ Excellent |
| Hindi | hi-IN | ⭐⭐⭐⭐⭐ Excellent |
| Tamil | ta-IN | ⭐⭐⭐⭐⭐ Excellent |
| Kannada | kn-IN | ⭐⭐⭐⭐⭐ Excellent |
| Malayalam | ml-IN | ⭐⭐⭐⭐⭐ Excellent |
| Bengali | bn-IN | ⭐⭐⭐⭐⭐ Excellent |
| Gujarati | gu-IN | ⭐⭐⭐⭐⭐ Excellent |
| Marathi | mr-IN | ⭐⭐⭐⭐⭐ Excellent |
| Punjabi | pa-IN | ⭐⭐⭐⭐⭐ Excellent |
| Odia | or-IN | ⭐⭐⭐⭐⭐ Excellent |
| English (India) | en-IN | ⭐⭐⭐⭐⭐ Excellent |

---

## 📊 Comparison

| Feature | gTTS | Sarvam AI |
|---------|------|-----------|
| Telugu Quality | ⭐⭐⭐ Good | ⭐⭐⭐⭐⭐ Excellent |
| Hindi Quality | ⭐⭐⭐⭐ Very Good | ⭐⭐⭐⭐⭐ Excellent |
| Natural Voices | ❌ Robotic | ✅ Human-like |
| Indian Languages | 3 | 10+ |
| Pronunciation | Basic | Native |
| Cost | Free | Free tier + Paid |

---

## 💰 Pricing

**Free Tier:**
- 10,000 characters/month
- Good for demos and testing

**Paid Plans:**
- Pay as you go
- ~₹0.50 per 1000 characters
- Much cheaper than Google Cloud

---

## 🧪 Test It

```bash
python sarvam_tts.py
```

You should see:
```
✅ Telugu TTS working!
✅ Hindi TTS working!
```

---

## 🔄 Fallback

If Sarvam AI fails or API key is missing:
- ✅ Automatically falls back to **gTTS**
- ✅ App continues working
- ⚠️ Voice quality will be lower

---

## 🎯 Recommendation

**For Production FIR System:**
Use **Sarvam AI** - it's specifically built for Indian government use cases!

---

**Get your free API key:** https://www.sarvam.ai 🚀
