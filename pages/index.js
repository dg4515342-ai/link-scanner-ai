
/**
 * API Endpoint: POST /api/chat
 * Conversational AI using free LLaMA model (Hugging Face Inference)
 */

const HF_API_KEY = process.env.HF_API_KEY || 'hf_default'; // Replace with actual key if needed

export async function generateAIResponse(userMessage, context = '', language = 'en') {
  try {
    // Using free Hugging Face Inference API
    // Models: mistral-7b, llama-2-7b-chat, etc.
    
    const systemPrompt = \`You are a helpful AI assistant that:
1. Answers questions about extracted web content
2. Provides explanations in \${language}
3. Uses web search results when available
4. Maintains conversation context
5. Responds in a friendly, informative manner

Context from extracted content:
\${context || 'No context provided'}\`;

    const response = await fetch(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${HF_API_KEY}\`
        },
        body: JSON.stringify({
          inputs: \`<s>[INST] \${systemPrompt}\n\nUser: \${userMessage} [/INST]\`,
          parameters: {
            max_length: 512,
            temperature: 0.7,
            top_p: 0.9
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(\`HF API error: \${response.status}\`);
    }

    const data = await response.json();
    const generatedText = data[0]?.generated_text || '';

    return {
      success: true,
      user_message: userMessage,
      ai_response: generatedText.split('[/INST]')[1]?.trim() || 'Unable to generate response',
      language: language,
      model: 'Mistral-7B',
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    return {
      success: false,
      error: error.message,
      user_message: userMessage
    };
  }
}

export function createChatRoute() {
  return async (req, res) => {
    const { message, context = '', language = 'en', search_results = null } = req.body;

    if (!message) {
      return res.status(400).json({
        error: 'Message is required',
        example: { message: 'What is this article about?', language: 'hi' }
      });
    }

    const enrichedContext = search_results 
      ? \`\${context}\n\nWeb Search Results:\n\${search_results}\`
      : context;

    const result = await generateAIResponse(message, enrichedContext, language);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  };
}
