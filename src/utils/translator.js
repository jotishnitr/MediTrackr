/**
 * Translation service utilizing LibreTranslate with robust fallbacks
 */

const LIBRE_TRANSLATE_ENDPOINTS = [
  "https://libretranslate.de/translate",
  "https://translate.argosopentech.com/translate",
  "https://libretranslate.com/translate",
];

/**
 * Translates any text to English
 * @param {string} text - Text to translate
 * @param {string} sourceLang - Optional 2-letter source language code (default "auto")
 * @returns {Promise<string>} Translated text in English
 */
export async function translateToEnglish(text, sourceLang = "auto") {
  if (!text || typeof text !== "string" || !text.trim()) return text;
  if (sourceLang === "en") return text;

  return await translateText(text, "en", sourceLang);
}

/**
 * Translates English text into a specific target language
 * @param {string} text - English text to translate
 * @param {string} targetLang - Target 2-letter language code (e.g. 'hi', 'te', 'ta', 'bn', 'mr', 'gu', 'kn', 'ml', 'or', 'pa')
 * @returns {Promise<string>} Translated text in target language
 */
export async function translateFromEnglish(text, targetLang) {
  if (!text || typeof text !== "string" || !text.trim()) return text;
  if (!targetLang || targetLang === "en") return text;

  // Normalize language code to 2-letter format (e.g. "hi-IN" -> "hi")
  const target = targetLang.toLowerCase().slice(0, 2);
  return await translateText(text, target, "en");
}

/**
 * General translation utility
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code
 * @param {string} sourceLang - Source language code (default "auto")
 * @returns {Promise<string>}
 */
export async function translateText(text, targetLang, sourceLang = "auto") {
  if (!text || typeof text !== "string" || !text.trim()) return text;
  
  const target = (targetLang || "en").toLowerCase().slice(0, 2);
  const source = (sourceLang || "auto").toLowerCase().slice(0, 2);

  if (target === source && source !== "auto") {
    return text;
  }

  // 1. Try LibreTranslate primary and mirror endpoints
  for (const endpoint of LIBRE_TRANSLATE_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          q: text,
          source: source === "auto" ? "auto" : source,
          target: target,
          format: "text",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.translatedText) {
          return data.translatedText;
        }
      }
    } catch (err) {
      console.warn(`LibreTranslate endpoint ${endpoint} failed:`, err.message);
    }
  }

  // 2. High-reliability fallback (Google Translate public gtx endpoint)
  try {
    const sl = source === "auto" ? "auto" : source;
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${target}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    if (res.ok) {
      const gData = await res.json();
      if (Array.isArray(gData) && Array.isArray(gData[0])) {
        const fullTranslation = gData[0]
          .map((item) => (item && item[0] ? item[0] : ""))
          .join("");
        if (fullTranslation.trim()) {
          return fullTranslation;
        }
      }
    }
  } catch (err) {
    console.warn("Fallback translation failed:", err.message);
  }

  // Safe fallback to original text if translation services are unreachable
  return text;
}
