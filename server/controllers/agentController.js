const aiService = require('../services/aiService');
const { agentTools } = require('../services/agentTools');
const auditService = require('../services/auditService');
const { v4: uuidv4 } = require('uuid');

const SYSTEM_PROMPT = `You are an AI shopping assistant for SportZone India, a premium sports and fitness e-commerce platform.

Your capabilities:
- Search and recommend products
- Add items to the user's cart
- Provide checkout previews
- Answer questions about products

CRITICAL TOOL USAGE RULES:

1. TOOL SELECTION — THIS IS MANDATORY:
   - User asks to FIND / SEARCH / BROWSE products → call searchProducts
   - User asks for RECOMMENDATIONS / "what goes well with" / "suggest products for" / "pair with" / "complement" → call getProductRecommendations
   - NEVER call searchProducts when the user is asking for recommendations or complementary products.
   - When user asks for recommendations for a product they mentioned (e.g. "Nike Air Zoom Running Shoes"), call getProductRecommendations with productId set to the EXACT product name string (e.g. productId: "Nike Air Zoom Running Shoes"). The tool will resolve the name to a real product internally.
   - You do NOT need to know the MongoDB ID. Just pass the product name as productId.

2. CONTEXT RESOLUTION:
   - If a user says "recommend products for it" or "what goes well with it" — "it" refers to the most recently mentioned or shown product.
   - Always resolve "it", "that", "these shoes", etc. to the actual product name from the conversation context.

3. RESPONSE AFTER TOOL CALL:
   - After calling getProductRecommendations, write a warm, conversational message like:
     "Here are some great products that pair perfectly with your [product name]! 🎯"
   - Do NOT say "Here are some great options" unless you are showing search results.
   - ALWAYS return a conversational text response. NEVER return an empty response.

CRITICAL SAFETY RULES (never violate these):
1. NEVER initiate payment without explicit user confirmation
2. ALWAYS show full pricing breakdown before payment
3. NEVER modify prices yourself
4. NEVER silently add items to cart without user consent
5. ALWAYS explain WHY you are recommending something
6. ALWAYS return a natural language conversational response to the user. NEVER return an empty text response, even if you are just showing cards.

Your personality:
- Friendly, helpful, and knowledgeable about sports and fitness
- Proactive with relevant recommendations
- Clear about pricing — always show amounts in Indian Rupees (₹)
- Transparent about what you're doing and why

When searching products:
1. Search for what the user asked
2. Present the top results clearly
3. Explain what you found

When showing recommendations:
1. Call getProductRecommendations with the product name as productId
2. Describe why each recommendation makes sense
3. Invite the user to add items to cart

When adding to cart:
1. Confirm the action with the user
2. Show updated cart total

When proceeding to payment:
1. Show full checkout preview
2. Clearly state that payment requires their explicit approval
3. NEVER proceed to payment without user clicking "Confirm & Pay"

Format product prices as ₹X,XXX using Indian number formatting.`;

// POST /api/agent/chat
const chat = async (req, res) => {
  try {
    const { message, messages = [], cartId, sessionId: clientSessionId } = req.body;
    const userId = req.user?._id;
    const sessionId = clientSessionId || uuidv4();

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    // Log user request
    await auditService.log({
      userId, sessionId,
      action: 'USER_REQUEST',
      input: { message },
      status: 'info',
      ipAddress: req.ip,
    });

    const conversationMessages = [
      ...messages,
      { role: 'user', content: message },
    ];

    // First AI call
    const aiResponse = await aiService.chat(conversationMessages, agentTools, SYSTEM_PROMPT);

    let finalResponse;
    let toolResults = [];
    let checkoutPreview = null;
    let cartData = null;

    if (aiResponse.type === 'tool_calls') {
      // Execute each tool call
      const toolCallResults = [];
      for (const toolCall of aiResponse.toolCalls) {
        const tool = agentTools.find(t => t.name === toolCall.name);
        if (!tool) {
          toolCallResults.push({ name: toolCall.name, result: { error: 'Tool not found' } });
          continue;
        }

        try {
          await auditService.log({
            userId, sessionId,
            action: 'AI_TOOL_CALL',
            toolName: toolCall.name,
            input: toolCall.args,
            status: 'info',
          });

          const result = await tool.fn({ ...toolCall.args, userId, sessionId, cartId });
          toolCallResults.push({ name: toolCall.name, result });

          // Extract cart/checkout for UI
          if (toolCall.name === 'createCheckoutPreview') {
            checkoutPreview = result;
          }
          if (toolCall.name === 'getCart' || toolCall.name === 'addToCart' || toolCall.name === 'removeFromCart') {
            cartData = result.cart || result;
          }

        } catch (toolErr) {
          await auditService.log({
            userId, sessionId,
            action: 'SYSTEM_ERROR',
            toolName: toolCall.name,
            input: toolCall.args,
            error: toolErr.message,
            status: 'failure',
          });
          toolCallResults.push({ name: toolCall.name, result: { error: toolErr.message } });
        }
      }

      toolResults = toolCallResults;

      // Get AI response after tool results
      const continueResponse = await aiService.continueWithToolResults(
        conversationMessages,
        toolCallResults,
        agentTools,
        SYSTEM_PROMPT
      );
      finalResponse = continueResponse;
    } else {
      finalResponse = aiResponse;
    }

    let responseText = finalResponse.content || finalResponse.text || '';
    
    // Fallback if AI returns empty text
    if (!responseText || responseText.trim() === '') {
      if (toolResults.some(t => t.name === 'searchProducts')) {
        const products = toolResults.find(t => t.name === 'searchProducts').result.products;
        if (products && products.length > 0) {
          responseText = "I found some great options for you! Have a look below.";
        } else {
          responseText = "I'm sorry, I couldn't find any products matching your request. Could you try adjusting your search?";
        }
      } else if (toolResults.some(t => t.name === 'getProductRecommendations')) {
        const recResult = toolResults.find(t => t.name === 'getProductRecommendations')?.result;
        const srcName = recResult?.sourceProduct?.name || 'your selected product';
        const recCount = recResult?.recommendations?.length || 0;
        if (recCount > 0) {
          responseText = `Here are some great products that pair perfectly with **${srcName}**! 🎯 These are handpicked based on what other customers frequently buy together.`;
        } else {
          responseText = `I couldn't find complementary products for **${srcName}** right now. Try searching for related categories like accessories or apparel!`;
        }
      } else if (toolResults.some(t => t.name === 'createCheckoutPreview')) {
        responseText = "I've prepared your checkout preview. Please review the details before proceeding to payment.";
      } else if (toolResults.some(t => t.name === 'getCart')) {
        responseText = "Here is the current status of your cart.";
      } else {
        responseText = "I've processed your request.";
      }
    }

    res.json({
      success: true,
      sessionId,
      response: responseText,
      toolCalls: toolResults,
      checkoutPreview,
      cartData,
      products: toolResults.find(t => t.name === 'searchProducts')?.result?.products || null,
      recommendations: toolResults.find(t => t.name === 'getProductRecommendations')?.result?.recommendations || null,
    });
  } catch (err) {
    console.error('Agent chat error:', err);
    res.status(500).json({ success: false, message: 'AI agent error: ' + err.message });
  }
};

module.exports = { chat };
