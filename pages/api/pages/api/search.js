
/**
 * API Endpoint: POST /api/web-search
 * Web search using Tavily API
 */

const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

export async function searchWeb(query) {
  if (!TAVILY_API_KEY) {
    throw new Error('TAVILY_API_KEY not configured');
  }

  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query: query,
        include_answer: true,
        max_results: 5,
        include_domains: [],
        exclude_domains: [],
        search_depth: 'basic'
      })
    });

    if (!response.ok) {
      throw new Error(`Tavily API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      query: query,
      answer: data.answer || null,
      results: data.results.map(r => ({
        title: r.title,
        url: r.url,
        snippet: r.content
      })),
      search_time: new Date().toISOString()
    };

  } catch (error) {
    return {
      success: false,
      error: error.message,
      query: query
    };
  }
}

export function createWebSearchRoute() {
  return async (req, res) => {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({
        error: 'Search query is required',
        example: { query: 'latest AI developments' }
      });
    }

    const result = await searchWeb(query);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  };
        }
