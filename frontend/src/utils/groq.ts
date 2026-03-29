const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Shared Groq key accessor for summary and translation calls
export function getGroqApiKey(): string | undefined {
  // Prefer Vite-exposed env; fallback is only for local debugging.
  return import.meta.env.VITE_GROQ_API_KEY || (window as any).__GROQ_API_KEY;
}

export async function generateSummary(text: string): Promise<string> {
  const apiKey = getGroqApiKey();
  if (!apiKey) {
    console.warn('Groq API key missing (set VITE_GROQ_API_KEY in frontend env)');
    return `Summary (mock): ${text.slice(0, 160)}...`;
  }

  const prompt = `You are an FIR summarizer for police officers. Given raw complaint text, produce a concise structured FIR note with clear labels (use the sample keys below). If a field is unknown, write "Not stated". Keep total under 110 words.

Expected format (one or two lines per item):
- Acts & Sections: ...
- Occurrence: Date/Time (from/to if available)
- Info Received at P.S.: Date/Time or "Not stated"
- Type of Information: ...
- Place of Occurrence: address / area / landmark
- Complainant: Name; Father/Husband; Mobile (if present)
- Accused: names/unknown with brief description
- Property: items & approx value
- Summary: 2 sentences of what happened
- Urgency: High / Medium / Low
- Action Suggested: next step in 1 line`;

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.4,
        max_tokens: 220,
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: text },
        ],
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error('Groq summary error', res.status, body);
      return `Summary (fallback): ${text.slice(0, 160)}...`;
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content?.trim();
    return content || `Summary (fallback): ${text.slice(0, 160)}...`;
  } catch (err) {
    console.error('Groq summary exception', err);
    return `Summary (fallback): ${text.slice(0, 160)}...`;
  }
}
