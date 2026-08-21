const { GoogleGenerativeAI } = require('@google/generative-ai');

// AI Provider abstraction - swap AI providers here
class AIService {
  constructor() {
    this.provider = process.env.AI_PROVIDER || 'gemini';
    this.initialized = false;
    this.init();
  }

  init() {
    try {
      if (this.provider.toLowerCase() === 'gemini') {
        const apiKey = process.env.AI_API_KEY;
        console.log(`[AI] GEMINI_KEY_PRESENT=${!!apiKey}`);
        if (apiKey) {
          console.log(`[AI] API Key starts with: ${apiKey.substring(0, 4)}...`);
        }

        if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
          console.warn('⚠️  AI API Key not configured. Using rule-based fallback AI.');
          // Temporarily disabled fallback for debugging
          // this.useFallback = true;
          this.useFallback = false;
          return;
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
        // Ensure we are using the correct model
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite' });
        this.useFallback = false;
        this.initialized = true;
        console.log('✅ Gemini AI initialized');
      }
    } catch (err) {
      console.error('[AI] GEMINI_ERROR=AI initialization failed:', err.message);
      this.useFallback = false; // Disabled fallback
    }
  }

  async chat(messages, tools, systemPrompt) {
    console.log(`[AI] PROVIDER=GEMINI`);
    console.log(`[AI] MODEL=gemini-3.1-flash-lite`);

    if (this.useFallback) {
      return this.fallbackChat(messages, tools);
    }

    if (!this.initialized) {
      throw new Error("Gemini AI is not properly initialized. Check API Key.");
    }

    try {
      const lastMessage = messages[messages.length - 1];
      const userQuery = lastMessage?.content || '';
      console.log(`[AI] USER_MESSAGE=${userQuery}`);

      const rawHistory = messages.slice(0, -1);
      const conversationHistory = [];
      let nextExpected = 'user';

      for (const msg of rawHistory) {
        const role = msg.role === 'assistant' ? 'model' : 'user';
        if (role === nextExpected) {
          conversationHistory.push({
            role,
            parts: [{ text: msg.content || JSON.stringify(msg.content) }]
          });
          nextExpected = role === 'user' ? 'model' : 'user';
        }
      }

      // History must end with model so that userQuery is next
      if (conversationHistory.length > 0 && conversationHistory[conversationHistory.length - 1].role === 'user') {
        conversationHistory.pop();
      }

      const toolDeclarations = tools.map(t => ({
        name: t.name,
        description: t.description,
        parameters: t.parameters,
      }));

      const chat = this.model.startChat({
        history: conversationHistory,
        tools: [{ functionDeclarations: toolDeclarations }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
      });

      const result = await chat.sendMessage(userQuery);
      const response = result.response;

      // Handle function calls
      const functionCalls = response.functionCalls();
      if (functionCalls && functionCalls.length > 0) {
        console.log(`[AI] TOOL_CALLS=${functionCalls.map(f => f.name).join(', ')}`);
        return {
          type: 'tool_calls',
          toolCalls: functionCalls.map(fc => ({
            name: fc.name,
            args: fc.args,
          })),
        };
      }

      const textResponse = response.text();
      console.log(`[AI] FINAL_RESPONSE=${textResponse.substring(0, 100)}...`);
      return {
        type: 'text',
        content: textResponse,
      };
    } catch (err) {
      console.error('[AI] GEMINI_ERROR=', err);
      throw err; // Fail explicitly instead of falling back
    }
  }

  async continueWithToolResults(originalMessages, toolResults, tools, systemPrompt) {
    if (this.useFallback) {
      return this.fallbackToolResult(toolResults);
    }

    try {
      console.log(`[AI] TOOL_RESULT processing ${toolResults.length} results`);
      const rawHistory = originalMessages.slice(0, -1);
      const conversationHistory = [];
      let nextExpected = 'user';

      for (const msg of rawHistory) {
        const role = msg.role === 'assistant' ? 'model' : 'user';
        if (role === nextExpected) {
          conversationHistory.push({
            role,
            parts: [{ text: msg.content || JSON.stringify(msg.content) }]
          });
          nextExpected = role === 'user' ? 'model' : 'user';
        }
      }

      if (conversationHistory.length > 0 && conversationHistory[conversationHistory.length - 1].role === 'user') {
        conversationHistory.pop();
      }

      const lastUserMsg = originalMessages[originalMessages.length - 1];

      const toolDeclarations = tools.map(t => ({
        name: t.name,
        description: t.description,
        parameters: t.parameters,
      }));

      const chat = this.model.startChat({
        history: conversationHistory,
        tools: [{ functionDeclarations: toolDeclarations }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
      });

      await chat.sendMessage(lastUserMsg?.content || '');

      const toolResultParts = toolResults.map(tr => ({
        functionResponse: {
          name: tr.name,
          response: { result: tr.result },
        },
      }));

      const finalResult = await chat.sendMessage(toolResultParts);
      const textResponse = finalResult.response.text();
      console.log(`[AI] FINAL_RESPONSE=${textResponse.substring(0, 100)}...`);
      return {
        type: 'text',
        content: textResponse,
      };
    } catch (err) {
      console.error('[AI] GEMINI_ERROR=', err);
      throw err; // Fail explicitly instead of falling back
    }
  }

  // Rule-based fallback when no AI key is configured
  fallbackChat(messages, tools) {
    const lastMessage = messages[messages.length - 1];
    const query = (lastMessage?.content || '').toLowerCase();

    // Detect intent and call appropriate tool
    if (query.includes('search') || query.includes('find') || query.includes('looking') || query.includes('need') || query.includes('want') || query.includes('show')) {
      const priceMatch = query.match(/₹?(\d+)/);
      const maxPrice = priceMatch ? parseInt(priceMatch[1]) : null;

      let category = null;
      if (query.includes('shoe') || query.includes('running')) category = 'Running';
      else if (query.includes('watch') || query.includes('electronic')) category = 'Electronics';
      else if (query.includes('glove') || query.includes('gym')) category = 'Fitness';
      else if (query.includes('sock') || query.includes('accessory')) category = 'Accessories';
      else if (query.includes('bottle') || query.includes('water')) category = 'Accessories';

      // Extract meaningful product keywords
      const stopWords = /\b(show|me|find|looking|for|need|want|a|an|the|some|under|below|above|less|than|within|please|can|you|i|us|our|any|good|best|top|what|have|got|do|has|budget|price|cheap|expensive|with|that|around|approximately)\b/gi;
      const searchQuery = query
        .replace(/₹?\d+/g, '')
        .replace(stopWords, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      // If we have a category, don't use a text search query if it's too generic
      const finalQuery = searchQuery.length > 2 && !category ? searchQuery : (searchQuery.length > 2 ? searchQuery : null);

      return {
        type: 'tool_calls',
        toolCalls: [{
          name: 'searchProducts',
          args: {
            ...(finalQuery && { query: finalQuery }),
            ...(maxPrice && { maxPrice }),
            ...(category && { category }),
          },
        }],
      };
    }

    if (query.includes('add') && (query.includes('cart') || query.includes('socks') || query.includes('shoes'))) {
      return {
        type: 'tool_calls',
        toolCalls: [{
          name: 'getCart',
          args: {},
        }],
      };
    }

    if (query.includes('cart') || query.includes('basket') || query.includes('what') && query.includes('added')) {
      return {
        type: 'tool_calls',
        toolCalls: [{ name: 'getCart', args: {} }],
      };
    }

    if (query.includes('checkout') || query.includes('pay') || query.includes('purchase') || query.includes('buy')) {
      return {
        type: 'tool_calls',
        toolCalls: [{ name: 'createCheckoutPreview', args: {} }],
      };
    }

    return {
      type: 'text',
      content: `I'm your AI shopping assistant! 🛍️ I can help you:\n• **Find products** - "Show me running shoes under ₹5000"\n• **Get recommendations** - based on your interests\n• **Manage your cart** - add or remove items\n• **Checkout** - with full price transparency\n\nWhat are you looking for today?`,
    };
  }

  fallbackToolResult(toolResults) {
    const results = toolResults.map(tr => tr.result);
    const firstResult = results[0];

    if (firstResult?.products && firstResult.products.length > 0) {
      const products = firstResult.products;
      const topProduct = products[0];
      let response = `🔍 I found **${products.length} products** matching your search!\n\n`;
      response += `**Top Pick:** ${topProduct.name} — ₹${topProduct.price.toLocaleString('en-IN')}\n`;
      response += `${topProduct.description}\n\n`;

      if (products.length > 1) {
        response += `**Other options:**\n`;
        products.slice(1, 3).forEach(p => {
          response += `• ${p.name} — ₹${p.price.toLocaleString('en-IN')}\n`;
        });
      }

      response += `\n💡 Would you like to add any of these to your cart? I can also suggest complementary products!`;
      return { type: 'text', content: response };
    }

    if (firstResult?.items !== undefined) {
      // Cart result
      const cart = firstResult;
      if (cart.items?.length === 0) {
        return { type: 'text', content: `Your cart is empty. Let me help you find something! Try: "Show me running shoes under ₹5000"` };
      }
      let response = `🛒 **Your Cart:**\n\n`;
      cart.items?.forEach(item => {
        response += `• ${item.name} × ${item.quantity} — ₹${(item.price * item.quantity).toLocaleString('en-IN')}\n`;
      });
      response += `\n**Total: ₹${cart.total?.toLocaleString('en-IN')}**\n\nReady to checkout? Say "proceed to payment" to continue!`;
      return { type: 'text', content: response };
    }

    if (firstResult?.cart) {
      // Checkout preview
      const preview = firstResult;
      return {
        type: 'text',
        content: `✅ **Checkout Preview Ready!**\n\nTotal: ₹${preview.cart?.total?.toLocaleString('en-IN')}\n\nPlease review and confirm your order below. Your payment requires explicit approval - I cannot charge you without your confirmation.`,
      };
    }

    return {
      type: 'text',
      content: `I've processed your request. Is there anything else I can help you with?`,
    };
  }
}

module.exports = new AIService();
