
/**
 * API Endpoint: POST /api/translate
 * Translates text to target language
 */

const SUPPORTED_LANGUAGES = {
  'hi': 'Hindi',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'pt': 'Portuguese',
  'ar': 'Arabic',
  'zh': 'Chinese',
  'ja': 'Japanese',
  'ru': 'Russian',
  'ko': 'Korean',
  'en': 'English'
};

export async function translateText(text, targetLang, apiKey) {
  // Using Google Translate API (free tier available)
  // Or use a self-hosted solution
  
  try {
    // Option 1: Using MyMemory Translate (100% free, no key needed)
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`
    );

    const data = await response.json();

    if (data.responseStatus === 200) {
      return {
        success: true,
        original: text,
        translated: data.responseData.translatedText,
        source_language: 'English',
        target_language: SUPPORTED_LANGUAGES[targetLang] || targetLang,
        lang_code: targetLang
      };
    }

    throw new Error('Translation service error');

  } catch (error) {
    return {
      success: false,
      error: error.message,
      text_preview: text.substring(0, 100)
    };
  }
}

export function createTranslateRoute() {
  return async (req, res) => {
    const { text, language = 'hi' } = req.body;

    if (!text) {
      return res.status(400).json({
        error: 'Text is required',
        example: { text: 'Hello world', language: 'hi' }
      });
    }

    const result = await translateText(text, language);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  };
}
