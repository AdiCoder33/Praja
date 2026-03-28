# Praja Frontend - React + Vite + TypeScript

AI-powered FIR filing system frontend built with React, TypeScript, and Vite.

## 🚀 Quick Start

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

Frontend will run at: **http://localhost:3000**

Backend API proxy configured to: **https://localhost:5000**

### Build for Production
```bash
npm run build
```

## 📁 Structure

```
src/
├── pages/              # Route pages
│   ├── LandingPage.tsx    # Homepage
│   ├── ComplaintPage.tsx  # Voice assistant
│   └── LoginPage.tsx      # Police login
├── components/         # Reusable components
│   ├── Navbar.tsx
│   ├── CircularGallery.tsx
│   └── VoiceAssistant.tsx
├── contexts/           # React contexts
│   └── LanguageContext.tsx
├── styles/             # CSS files
│   ├── index.css
│   └── voice-assistant.css
└── main.tsx           # Entry point
```

## 🛠️ Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool (fast!)
- **React Router** - Routing
- **Web Speech API** - Voice input/output

## 🔌 API Integration

Frontend proxies API calls to Flask backend:
- `/api/chat` → Backend chat endpoint
- `/health` → Backend health check

Configured in `vite.config.ts`

## 🌐 Routes

- `/` - Landing page
- `/complaint` - Voice FIR assistant
- `/login` - Police portal login

## 🎨 Customization

### Landing Page
Edit `src/pages/LandingPage.tsx` - Your custom homepage code

### Styling
- Global styles: `src/styles/index.css`
- Voice assistant: `src/styles/voice-assistant.css`

### Languages
Edit translations in `src/contexts/LanguageContext.tsx`

## 📦 Dependencies

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.22.0"
}
```

## 🏗️ Build Output

Production build goes to: `dist/`

Can be served by:
- Flask backend (static files)
- Netlify/Vercel
- Any static file server

---

**Made with ❤️ for Praja**
