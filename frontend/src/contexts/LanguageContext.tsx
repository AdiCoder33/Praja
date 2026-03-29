import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'te' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    'hero.title': 'AI-Powered FIR Filing System',
    'hero.quote': 'Justice delayed is justice denied.\nFile your complaint instantly with AI assistance.',
    'hero.btn': 'File Complaint Now',
    'banner.heading': 'Real-Time Updates',
    'banner.text': '🔔 24/7 AI Support • Instant Filing • Secure & Confidential • Multi-Language Support • Legal Accuracy Guaranteed',
    'card.citizen.title': 'For Citizens',
    'card.citizen.desc': 'File your FIR quickly and easily with AI-powered voice assistance in your language.',
    'card.citizen.btn': 'File FIR',
    'card.police.title': 'Law Enforcement',
    'card.police.desc': 'Access police portal to view, manage, and process filed complaints.',
    'card.police.btn': 'Police Login',
    'about.title': 'How It Works',
    'about.desc': 'Our AI-powered system makes filing FIR simple, fast, and accessible',
    'gallery.1': 'AI-Powered Assistance',
    'gallery.2': 'Data Privacy & Security',
    'gallery.3': 'Instant Filing',
    'gallery.4': 'Secure Cloud Storage',
    'gallery.5': 'Voice Recognition',
    'gallery.6': 'Legal Accuracy',
    'footer.title': 'Ananthapuramu Police',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
    'footer.support': 'Support',
    'footer.bottom': '© 2024 Ananthapuramu Police Department. All rights reserved.',
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.logo': 'Praja FIR',
    'nav.restart': '🔄 Restart Report',
    'complaint.input.placeholder': 'Type here or click mic...',
    'complaint.input.send': 'Send',
    'complaint.footer.hint': '🎤 Click mic for continuous conversation - I\'ll listen after each response!',
    'complaint.footer.powered': '💡 Powered by Sarvam AI 🇮🇳',
    'complaint.initial.msg': 'Hello! I am your AI Assistant. Please tell me about your complaint. You can speak in English, Hindi, or Telugu.',
  },
  te: {
    'hero.title': 'AI ఆధారిత FIR దాఖలు వ్యవస్థ',
    'hero.quote': 'ఆలస్యమైన న్యాయం అన్యాయం.\nAI సహాయంతో మీ ఫిర్యాదును తక్షణమే దాఖలు చేయండి.',
    'hero.btn': 'ఇప్పుడే ఫిర్యాదు చేయండి',
    'banner.heading': 'నిజ-సమయ నవీకరణలు',
    'banner.text': '🔔 24/7 AI మద్దతు • తక్షణ దాఖలు • సురక్షితం & గోప్యం • బహుభాషా మద్దతు • చట్టపరమైన ఖచ్చితత్వం హామీ',
    'card.citizen.title': 'పౌరులకు',
    'card.citizen.desc': 'మీ భాషలో AI వాయిస్ సహాయంతో మీ FIRని త్వరగా మరియు సులభంగా దాఖలు చేయండి.',
    'card.citizen.btn': 'FIR దాఖలు చేయండి',
    'card.police.title': 'చట్ట అమలు',
    'card.police.desc': 'దాఖలైన ఫిర్యాదులను చూడటానికి, నిర్వహించడానికి పోలీసు పోర్టల్‌ను యాక్సెస్ చేయండి.',
    'card.police.btn': 'పోలీసు లాగిన్',
    'about.title': 'ఇది ఎలా పనిచేస్తుంది',
    'about.desc': 'మా AI-ఆధారిత వ్యవస్థ FIR దాఖలును సరళంగా, వేగంగా మరియు అందుబాటులో ఉంచుతుంది',
    'gallery.1': 'AI-ఆధారిత సహాయం',
    'gallery.2': 'డేటా గోప్యత & భద్రత',
    'gallery.3': 'తక్షణ దాఖలు',
    'gallery.4': 'సురక్షిత క్లౌడ్ నిల్వ',
    'gallery.5': 'వాయిస్ గుర్తింపు',
    'gallery.6': 'చట్టపరమైన ఖచ్చితత్వం',
    'footer.title': 'అనంతపురం పోలీస్',
    'footer.privacy': 'గోప్యతా విధానం',
    'footer.terms': 'సేవా నిబంధనలు',
    'footer.support': 'మద్దతు',
    'footer.bottom': '© 2024 అనంతపురం పోలీసు విభాగం. అన్ని హక్కులు రక్షించబడ్డాయి.',
    'nav.home': 'హోమ్',
    'nav.about': 'గురించి',
    'nav.contact': 'సంప్రదించండి',
    'nav.logo': 'ప్రజా ఎఫ్.ఐ.ఆర్',
    'nav.restart': '🔄 నివేదికను పునఃప్రారంభించండి',
    'complaint.input.placeholder': 'ఇక్కడ టైప్ చేయండి లేదా మైక్ క్లిక్ చేయండి...',
    'complaint.input.send': 'పంపండి',
    'complaint.footer.hint': '🎤 నిరంతర సంభాషణ కోసం మైక్ క్లిక్ చేయండి - ప్రతి ప్రతిస్పందన తర్వాత నేను వింటాను!',
    'complaint.footer.powered': '💡 సర్వం AI 🇮🇳 ద్వారా ఆధారితం',
    'complaint.initial.msg': 'నమస్కారం! నేను మీ AI సహాయకుడిని. దయచేసి మీ ఫిర్యాదు గురించి నాకు తెలియజేయండి. మీరు ఇంగ్లీష్, హిందీ లేదా తెలుగులో మాట్లాడవచ్చు.',
  },
  hi: {
    'hero.title': 'AI-संचालित FIR दाखिल प्रणाली',
    'hero.quote': 'देर से मिला न्याय, न्याय नहीं है।\nAI सहायता से अपनी शिकायत तुरंत दर्ज करें।',
    'hero.btn': 'अभी शिकायत दर्ज करें',
    'banner.heading': 'वास्तविक समय अपडेट',
    'banner.text': '🔔 24/7 AI सहायता • तत्काल दाखिल • सुरक्षित और गोपनीय • बहुभाषी समर्थन • कानूनी सटीकता की गारंटी',
    'card.citizen.title': 'नागरिकों के लिए',
    'card.citizen.desc': 'अपनी भाषा में AI आवाज सहायता के साथ अपनी FIR जल्दी और आसानी से दर्ज करें।',
    'card.citizen.btn': 'FIR दर्ज करें',
    'card.police.title': 'कानून प्रवर्तन',
    'card.police.desc': 'दर्ज शिकायतों को देखने, प्रबंधित करने के लिए पुलिस पोर्टल एक्सेस करें।',
    'card.police.btn': 'पुलिस लॉगिन',
    'about.title': 'यह कैसे काम करता है',
    'about.desc': 'हमारी AI-संचालित प्रणाली FIR दाखिल करना सरल, तेज़ और सुलभ बनाती है',
    'gallery.1': 'AI-संचालित सहायता',
    'gallery.2': 'डेटा गोपनीयता और सुरक्षा',
    'gallery.3': 'तत्काल दाखिल',
    'gallery.4': 'सुरक्षित क्लाउड स्टोरेज',
    'gallery.5': 'आवाज पहचान',
    'gallery.6': 'कानूनी सटीकता',
    'footer.title': 'अनंतपुरम पुलिस',
    'footer.privacy': 'गोपनीयता नीति',
    'footer.terms': 'सेवा की शर्तें',
    'footer.support': 'सहायता',
    'footer.bottom': '© 2024 अनंतपुरम पुलिस विभाग। सर्वाधिकार सुरक्षित।',
    'nav.home': 'होम',
    'nav.about': 'के बारे में',
    'nav.contact': 'संपर्क करें',
    'nav.logo': 'प्रजा एफ़आईआर',
    'nav.restart': '🔄 रिपोर्ट पुनः शुरू करें',
    'complaint.input.placeholder': 'यहाँ टाइप करें या माइक पर क्लिक करें...',
    'complaint.input.send': 'भेजें',
    'complaint.footer.hint': '🎤 निरंतर बातचीत के लिए माइक पर क्लिक करें - मैं हर प्रतिक्रिया के बाद सुनूँगा!',
    'complaint.footer.powered': '💡 सर्वम AI 🇮🇳 द्वारा संचालित',
    'complaint.initial.msg': 'नमस्ते! मैं आपका AI सहायक हूँ। कृपया मुझे अपनी शिकायत के बारे में बताएं। आप अंग्रेजी, हिंदी या तेलुगु में बात कर सकते हैं।',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return (translations[language] as any)[key] || (translations.en as any)[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
