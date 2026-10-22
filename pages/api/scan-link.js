
/**
 * API Endpoint: POST /api/scan-link
 * Extracts English text from any URL
 */

export async function scanLink(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    
    // Remove script, style, and meta tags
    const cleaned = html
      .replace(/<script[^>]*>.*?<\/script>/gs, '')
      .replace(/<style[^>]*>.*?<\/style>/gs, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (cleaned.length === 0) {
      throw new Error('No extractable text found');
    }

    return {
      success: true,
      url: url,
      extracted_text: cleaned.substring(0, 5000), // First 5000 chars
      char_count: cleaned.length,
      language: 'English',
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    return {
      success: false,
      error: error.message,
      url: url
    };
  }
}

// Express route handler
export function createScanLinkRoute() {
  return async (req, res) => {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        error: 'URL is required',
        example: { url: 'https://example.com' }
      });
    }

    const result = await scanLink(url);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  };
      }
