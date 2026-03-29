import { generateSummary } from './groq';
import { translateText } from './translate';

export interface FIRProcessingResult {
  englishText: string;
  summary: string;
  category: string;
  priority: string;
}

// Mock translation to English for internal storage
function toEnglishMock(text: string) {
  if (!text) return '';
  return text; // assume input is already English; extend with real translation later
}

export async function processFIR(inputText: string): Promise<FIRProcessingResult> {
  const englishText = toEnglishMock(inputText);
  const lower = englishText.toLowerCase();

  let category = 'General';
  if (lower.includes('stolen') || lower.includes('theft') || lower.includes('bike') || lower.includes('lost')) {
    category = 'Theft';
  } else if (lower.includes('attack') || lower.includes('assault') || lower.includes('hit')) {
    category = 'Assault';
  }

  let priority = 'Medium';
  if (lower.includes('urgent') || lower.includes('help') || lower.includes('immediately')) {
    priority = 'High';
  }

  // Mock summary via Groq placeholder
  const summary = await generateSummary(englishText);

  return {
    englishText,
    summary,
    category,
    priority,
  };
}

// Helper to present translated text while keeping English stored
export function present(text: string, lang: string) {
  return translateText(text, lang);
}
