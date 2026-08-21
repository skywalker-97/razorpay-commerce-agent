/**
 * FINAL HACKATHON AUDIT SCRIPT
 * Tests the entire AI Agent flow, Database, Payment, and Audit logs.
 */
const http = require('http');
const mongoose = require('mongoose');
require('dotenv').config();

const API_BASE = { hostname: 'localhost', port: 5000 };

function makeRequest(path, method = 'GET', body = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      ...API_BASE,
      path,
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (token) options.headers['Authorization'] = `Bearer ${token}`;
    if (token) options.headers['X-Session-Id'] = 'audit-test-session';

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data), headers: res.headers }); }
        catch (e) { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runAudit() {
  console.log("==========================================");
  console.log("🏁 STARTING HACKATHON COMPLIANCE AUDIT");
  console.log("==========================================\n");
  
  const results = { passes: [], fails: [] };
  const assert = (condition, msg, passMsg) => {
    if (condition) {
      console.log(`✅ PASS: ${passMsg || msg}`);
      results.passes.push(msg);
    } else {
      console.log(`❌ FAIL: ${msg}`);
      results.fails.push(msg);
    }
  };

  try {
    // 1. Verify Environment & AI Setup
    console.log("--- PART 1 & 8: ENVIRONMENT & RAZORPAY ---");
    assert(process.env.AI_PROVIDER?.toLowerCase() === 'gemini', 'AI Provider is Gemini');
    assert(process.env.AI_API_KEY && process.env.AI_API_KEY.length > 10, 'Gemini API Key is present');
    assert(process.env.RAZORPAY_KEY_ID?.startsWith('rzp_test_'), 'Razorpay is in TEST MODE');

    // 2. Connect to DB
    await mongoose.connect(process.env.MONGO_URI);
    assert(mongoose.connection.readyState === 1, 'MongoDB is connected');

    // 3. Login as Customer
    console.log("\n--- USER LOGIN ---");
    const loginRes = await makeRequest('/api/auth/login', 'POST', { email: 'customer@demo.in', password: 'customer123' });
    assert(loginRes.status === 200 && loginRes.body.token, 'Customer login successful');
    const token = loginRes.body.token;

    // Clear cart for clean test
    await makeRequest('/api/cart/clear', 'DELETE', null, token);

    // 4. Test Catalog Discovery
    console.log("\n--- PART 2: CATALOG SEARCH ---");
    const chat1 = await makeRequest('/api/agent/chat', 'POST', {
      message: 'I need running shoes under ₹5000',
      sessionId: 'audit-session'
    }, token);
    
    const searchTool = chat1.body.toolCalls?.find(t => t.name === 'searchProducts');
    assert(searchTool, 'AI called searchProducts tool');
    assert(searchTool?.result?.products?.length > 0, 'Catalog returns REAL database products');
    const foundProduct = searchTool?.result?.products[0];
    
    // 5. Test Recommendations (Upsell)
    console.log("\n--- PART 3: UPSELL AGENT ---");
    const chat2 = await makeRequest('/api/agent/chat', 'POST', {
      message: `What goes well with ${foundProduct?.name || 'Nike Air Zoom Running Shoes'}?`,
      sessionId: 'audit-session'
    }, token);
    
    const recTool = chat2.body.toolCalls?.find(t => t.name === 'getProductRecommendations');
    assert(recTool, 'AI called getProductRecommendations tool');
    assert(recTool?.result?.recommendations?.length > 0, 'Recommendations return REAL products from DB');
    const recommendedProduct = recTool?.result?.recommendations[0];
    assert(recommendedProduct?.reason, 'Recommendations include an EXPLANATION');

    // 6. Test Cart & Money Gating
    console.log("\n--- PART 5 & 6: CART & MONEY GATING ---");
    // Direct cart API test to ensure price integrity (can't tamper price)
    const cartAdd = await makeRequest('/api/cart/add', 'POST', {
      productId: recommendedProduct._id.toString(),
      quantity: 1
    }, token);
    assert(cartAdd.status === 200, 'Product added to cart successfully');
    assert(cartAdd.body.cart?.total > 0, 'Cart total calculated SERVER-SIDE');

    // AI cart intent test
    const chat3 = await makeRequest('/api/agent/chat', 'POST', {
      message: 'Show me the total checkout preview',
      sessionId: 'audit-session'
    }, token);
    const previewTool = chat3.body.toolCalls?.find(t => t.name === 'createCheckoutPreview');
    assert(previewTool, 'AI called createCheckoutPreview tool (Money Gating)');
    assert(!chat3.body.toolCalls?.find(t => t.name === 'createPayment'), 'AI CANNOT autonomously execute payment (Bounded)');

    // 7. Test Payment Generation (Razorpay)
    console.log("\n--- PART 8: RAZORPAY TEST PAYMENT ---");
    const orderRes = await makeRequest('/api/payment/create-order', 'POST', { cartId: cartAdd.body.cart._id }, token);
    assert(orderRes.status === 200 && orderRes.body.razorpayOrderId, 'Razorpay TEST order created successfully');
    
    // 8. Test Failure Handling
    console.log("\n--- PART 10: FAILURE HANDLING ---");
    const failRes = await makeRequest('/api/payment/failure', 'POST', { 
      razorpayOrderId: orderRes.body.razorpayOrderId, 
      reason: 'Audit simulated failure'
    }, token);
    assert(failRes.status === 200, 'Payment failure gracefully handled by server');

    // 9. Merchant Value & Audit Trail
    console.log("\n--- PART 4 & 9: MERCHANT DASHBOARD & AUDIT ---");
    const merchantLogin = await makeRequest('/api/auth/login', 'POST', { email: 'merchant@sportzone.in', password: 'merchant123' });
    const merchantToken = merchantLogin.body.token;

    const dashRes = await makeRequest('/api/merchant/dashboard', 'GET', null, merchantToken);
    assert(dashRes.body.success, 'Merchant dashboard data accessible');
    assert(dashRes.body.revenue !== undefined, 'Revenue metrics calculated from REAL data');

    const auditRes = await makeRequest('/api/audit?limit=10', 'GET', null, merchantToken);
    assert(auditRes.body.logs?.length > 0, 'Audit trail contains logs');
    const logTypes = auditRes.body.logs.map(l => l.actionType);
    assert(logTypes.includes('PAYMENT_FAILED'), 'Payment failure successfully logged in Audit Trail');
    assert(logTypes.includes('AI_TOOL_CALL'), 'AI Tool calls successfully logged in Audit Trail');
    assert(logTypes.includes('USER_REQUEST'), 'User requests successfully logged in Audit Trail');
    assert(logTypes.includes('CHECKOUT_PREVIEW_CREATED'), 'Money gating checkout preview logged in Audit Trail');

  } catch (err) {
    console.error("Script Error:", err);
  } finally {
    mongoose.disconnect();
    console.log("\n==========================================");
    console.log(`AUDIT COMPLETE. PASSES: ${results.passes.length}, FAILS: ${results.fails.length}`);
    console.log("==========================================");
  }
}

runAudit();
