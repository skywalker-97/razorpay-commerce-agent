<div align="center">

<img src="https://img.shields.io/badge/Razorpay-Hackathon-02042B?style=for-the-badge&logo=razorpay&logoColor=3395FF" />
<img src="https://img.shields.io/badge/Track_01-AI_Growth_%26_Agentic_Commerce-0ea5e9?style=for-the-badge" />
<img src="https://img.shields.io/badge/Stack-MERN_%2B_Gemini-10b981?style=for-the-badge" />

<br/><br/>

```
██████╗  █████╗ ███████╗ ██████╗ ██████╗ ██████╗  █████╗ ██╗   ██╗
██╔══██╗██╔══██╗╚══███╔╝██╔═══██╗██╔══██╗██╔══██╗██╔══██╗╚██╗ ██╔╝
██████╔╝███████║  ███╔╝ ██║   ██║██████╔╝██████╔╝███████║ ╚████╔╝ 
██╔══██╗██╔══██║ ███╔╝  ██║   ██║██╔══██╗██╔═══╝ ██╔══██║  ╚██╔╝  
██║  ██║██║  ██║███████╗╚██████╔╝██║  ██║██║     ██║  ██║   ██║   
╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝  ╚═╝   ╚═╝   
          C O M M E R C E   A G E N T   —   A I   P O W E R E D
```

### *The AI that sells. The guardrails that protect. The data that proves it.*

<br/>

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Gemini](https://img.shields.io/badge/Google-Gemini_AI-4285F4?style=flat-square&logo=google&logoColor=white)](https://aistudio.google.com)
[![Razorpay](https://img.shields.io/badge/Razorpay-TEST_MODE-3395FF?style=flat-square&logo=razorpay&logoColor=white)](https://razorpay.com)

</div>

---

## 🚀 Live Demo

- **Frontend Application**: [https://razorpay-commerce-agent-frontend.onrender.com](https://razorpay-commerce-agent-frontend.onrender.com)
- **Backend API**: [https://razorpay-commerce-agent-api.onrender.com](https://razorpay-commerce-agent-api.onrender.com)

---

## ⚡ What Is This?

**RazorPay Commerce Agent** is a full-stack, production-grade AI shopping assistant built for **Razorpay Hackathon Track 01 — AI Growth & Agentic Commerce**.

A customer opens a chat. Types "I need running shoes under ₹5000." The AI finds products, recommends complementary items, explains why, adds them to cart on approval, shows the full price breakdown, and processes a real Razorpay TEST MODE payment — all logged immutably in an audit trail.

No hallucinated prices. No autonomous charges. No black-box decisions. Every rupee traced.

---

## 🎬 3-Minute Demo

```
1. Login → customer@demo.in / customer123
2. AI Agent → "I need running shoes under ₹5000"
3. AI finds Nike Air Zoom Running Shoes — ₹3,999 ✓
4. AI recommends Sports Socks, Running Shorts, Water Bottle
5. Click "Add to Cart" on recommendation card
6. Cart sidebar updates — ₹4,498 + 18% GST = ₹5,307
7. Click "Proceed to Checkout"
8. Review full itemized preview
9. Check "I confirm this order" → Click "Confirm & Pay"
10. Razorpay TEST checkout → card: 4111 1111 1111 1111
11. ✅ Payment success page + order number
12. Switch → merchant@sportzone.in / merchant123
13. Dashboard shows updated revenue + AI-assisted split
14. Audit Trail shows every event with timestamps
```

---

## ✨ Feature Breakdown

### 🤖 AI Commerce Agent
- Natural language product discovery — "show me gym gear under ₹2000"
- Google **Gemini** AI with 8 registered function-calling tools
- Product name → MongoDB ID resolution (no hallucinated IDs)
- Context-aware follow-ups — "recommend products for it" resolves correctly
- Real upsell/cross-sell from seeded MongoDB relationships
- Every recommendation has an explicit **reason** shown to the user

### 🛒 Cart & Commerce
- Add, remove, update quantity (+ / − buttons with live API calls)
- Real-time cart totals: subtotal → discount → 18% GST → total
- AI-flagged items marked `AI Recommended` with reason
- Cart persists across sessions (MongoDB-backed)

### 💳 Razorpay Payments (TEST MODE)
- Server-side order creation via Razorpay Node SDK
- HMAC-SHA256 signature verification on every payment
- Payment success → order created in MongoDB
- Payment failure → logged, user redirected, **no auto-retry**
- Max 3 payment attempts enforced server-side

### 🏪 Merchant Dashboard
- Revenue KPIs: Total / AI-Assisted / Upsell revenue
- Recharts analytics — revenue trend, AI vs regular split
- Product catalog with stock and sales data
- Full audit log with filters (action type, date, status)

### 🛡️ Safety Guardrails (8 Rules)
| # | Rule | Enforcement |
|---|------|-------------|
| 1 | AI cannot charge autonomously | Payment API blocked from agent tools |
| 2 | Explicit user confirmation required | "Confirm & Pay" button mandatory |
| 3 | Full pricing transparency | Itemized breakdown always shown first |
| 4 | Server-side amount calculation | Client total never trusted |
| 5 | Bounded payment retries | Max 3 attempts, server-enforced |
| 6 | Immutable audit trail | Every action → MongoDB AuditLog |
| 7 | Graceful failure | No automatic retry on decline |
| 8 | TEST MODE enforcement | Key prefix validated before checkout |

---

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                     BROWSER (React + Vite)                       │
│                                                                  │
│  /          Landing Page (dark glassmorphism, network bg)        │
│  /login     JWT Auth — 3 roles: customer / merchant / admin      │
│  /customer  AI Chat Agent (Framer Motion, real-time streaming)   │
│  /products  Product Catalog (filter by category/price)           │
│  /cart      Shopping Cart (quantity stepper, remove, totals)     │
│  /checkout  Checkout Preview → Razorpay Modal                    │
│  /merchant  Dashboard + Products + Audit Logs                    │
└─────────────────────────┬────────────────────────────────────────┘
                          │ REST API (Axios + JWT Bearer)
┌─────────────────────────▼────────────────────────────────────────┐
│                     EXPRESS.JS SERVER (:5000)                    │
│                                                                  │
│  /api/auth      register · login · me                            │
│  /api/products  list · detail · categories · recommendations     │
│  /api/cart      get · add · remove · updateQty · clear           │
│  /api/agent     chat (tool-calling loop)                         │
│  /api/payment   create-order · verify · failure · status         │
│  /api/merchant  dashboard · products · orders                    │
│  /api/audit     logs (paginated, filterable)                     │
└────────┬──────────────────────┬───────────────────┬─────────────┘
         │                      │                   │
┌────────▼────────┐  ┌──────────▼──────────┐  ┌────▼──────────────┐
│    MongoDB      │  │   Google Gemini AI   │  │  Razorpay SDK     │
│    Atlas        │  │   gemini-flash-lite  │  │  TEST MODE only   │
│                 │  │   8 function tools   │  │  HMAC verify      │
│  Collections:   │  │   Tool call loop     │  │  Server-side amt  │
│  User           │  │   Name→ID resolver   │  └───────────────────┘
│  Product        │  └─────────────────────┘
│  Cart           │
│  Order          │
│  Payment        │
│  Recommendation │
│  AuditLog       │
│  Merchant       │
└─────────────────┘
```

---

## 🤖 Agent Tool Registry

The Gemini AI has access to 8 callable tools, each with input validation and audit logging:

| Tool | Args | What It Does |
|------|------|--------------|
| `searchProducts` | `query, maxPrice, category` | Full-text + filter search in MongoDB |
| `getProduct` | `productId \| name` | Fetch single product with full details |
| `getProductRecommendations` | `productId \| name` | Upsell + cross-sell from seeded relationships |
| `addToCart` | `productId, quantity` | Add item with stock validation |
| `removeFromCart` | `productId` | Remove item from active cart |
| `getCart` | — | Return full cart with totals |
| `calculateCart` | — | Recalculate subtotal / GST / total |
| `createCheckoutPreview` | — | Full itemized preview before payment |

**Tool call flow:**
```
User message → Gemini → tool_calls[] → execute each tool → 
MongoDB result → Gemini (with results) → final text response + structured JSON
→ Frontend renders product cards / recommendation cards
```

---

## 🗂️ Project Structure

```
razorpay-commerce-agent/
│
├── client/                         # React 18 + Vite frontend
│   └── src/
│       ├── components/
│       │   ├── Navbar.jsx           # Role-aware nav with cart count
│       │   ├── ProductCard.jsx      # Product display + add to cart
│       │   ├── RecommendationCard.jsx  # AI rec with type badge + reason
│       │   ├── PaymentConfirmModal.jsx # Explicit approval modal
│       │   └── NetworkBackground.jsx   # Animated canvas network
│       ├── pages/
│       │   ├── Landing.jsx          # Hero + feature showcase
│       │   ├── Login.jsx            # JWT auth form
│       │   ├── CustomerAgent.jsx    # 🔥 Main AI chat interface
│       │   ├── Products.jsx         # Browse & filter catalog
│       │   ├── ProductDetail.jsx    # Single product + recommendations
│       │   ├── CartPage.jsx         # Cart with +/- and delete
│       │   ├── Checkout.jsx         # Order review + Razorpay trigger
│       │   ├── PaymentSuccess.jsx   # Order confirmation
│       │   ├── PaymentFailure.jsx   # Graceful failure (no auto-retry)
│       │   └── merchant/
│       │       ├── Dashboard.jsx    # Revenue KPIs + Recharts
│       │       ├── Products.jsx     # Product management
│       │       └── AuditLogs.jsx   # Full event log with filters
│       ├── context/
│       │   ├── AuthContext.jsx      # JWT + user state
│       │   └── CartContext.jsx      # Cart state + API calls
│       └── services/
│           └── api.js               # Axios instance with JWT interceptor
│
└── server/                          # Node.js + Express backend
    ├── controllers/
    │   ├── agentController.js       # 🔥 Tool-calling orchestrator + system prompt
    │   ├── authController.js        # Register / login / profile
    │   ├── cartController.js        # Cart CRUD
    │   ├── paymentController.js     # Razorpay order + verify + failure
    │   ├── productController.js     # Product listing + recommendations
    │   ├── merchantController.js    # Dashboard stats + orders
    │   └── auditController.js       # Audit log retrieval
    ├── services/
    │   ├── aiService.js             # Gemini AI wrapper (chat + tool results)
    │   ├── agentTools.js            # 8 tool functions + MongoDB logic
    │   └── auditService.js          # Centralized audit logger
    ├── models/
    │   ├── User.js                  # customer / merchant / admin roles
    │   ├── Product.js               # upsell/crossSell refs, tags, stock
    │   ├── Cart.js                  # items[], calculateTotals()
    │   ├── Order.js                 # Post-payment order record
    │   ├── Payment.js               # Razorpay payment lifecycle
    │   ├── Recommendation.js        # Logged recommendation events
    │   ├── AuditLog.js              # Immutable event ledger
    │   └── Merchant.js              # Business + stats
    ├── middleware/
    │   ├── auth.js                  # JWT authenticate + optionalAuth
    │   └── errorHandler.js          # Global error + 404 handler
    ├── config/database.js           # Mongoose connect
    └── utils/seed.js                # 12 products + 3 users + upsell graph
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js `v18+`
- MongoDB Atlas account (or local MongoDB)
- Google AI Studio API key (optional — rule-based fallback included)
- Razorpay TEST MODE keys (optional — checkout requires this)

---

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd razorpay-commerce-agent

# Install backend deps
cd server && npm install

# Install frontend deps
cd ../client && npm install
```

---

### 2. Configure Environment

Create `server/.env`:

```env
# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# MongoDB
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/razorpay_commerce

# Auth
JWT_SECRET=your_super_secret_jwt_key_min_32_chars

# AI (optional — app works without this via rule-based fallback)
AI_PROVIDER=gemini
AI_API_KEY=AIza...your_gemini_key

# Razorpay TEST MODE (required for payment flow)
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret
```

---

### 3. Seed the Database

```bash
cd server
node utils/seed.js
```

This creates:
- ✅ 12 products across 5 categories (Running, Electronics, Fitness, Accessories, Apparel)
- ✅ Upsell/cross-sell relationships between products
- ✅ 3 demo users (customer, merchant, admin)
- ✅ Merchant profile with starter stats

---

### 4. Run

```bash
# Terminal 1 — Backend
cd server
npm start          # or: npm run dev (nodemon)

# Terminal 2 — Frontend  
cd client
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000 |
| Health Check | http://localhost:5000/health |

---

## 🔑 Demo Credentials

| Role | Email | Password | Access |
|------|-------|----------|--------|
| 👤 Customer | `customer@demo.in` | `customer123` | AI Agent, Cart, Checkout |
| 🏪 Merchant | `merchant@sportzone.in` | `merchant123` | Dashboard, Products, Audit |
| 🔧 Admin | `admin@razorpay.in` | `admin123` | All routes |

---

## 💳 Test Payment Details

Use these in the Razorpay TEST checkout:

| Field | Value |
|-------|-------|
| Card Number | `4111 1111 1111 1111` |
| Expiry | `12/25` |
| CVV | `111` |
| OTP | `123456` |

> ⚠️ **TEST MODE only.** No real money is charged. Never commit your Razorpay secret keys.

---

## 📋 Audit Trail Events

Every action is logged to the `AuditLog` collection with full JSON input/output:

| Event | Trigger |
|-------|---------|
| `USER_REQUEST` | Every chat message sent |
| `AI_TOOL_CALL` | Every Gemini tool invocation |
| `AI_SEARCH_PRODUCTS` | Product search executed |
| `AI_GET_PRODUCT` | Product detail fetched |
| `AI_RECOMMENDATION` | Recommendations generated |
| `CART_UPDATED` | Item added to cart |
| `CART_ITEM_REMOVED` | Item removed from cart |
| `CHECKOUT_PREVIEW_CREATED` | Checkout preview generated |
| `RAZORPAY_ORDER_CREATED` | Payment order created |
| `PAYMENT_SUCCESS` | Payment verified ✅ |
| `PAYMENT_FAILED` | Payment failed / cancelled ❌ |
| `ORDER_CREATED` | Order persisted post-payment |
| `SYSTEM_ERROR` | Any tool or API failure |

Each log entry includes: `timestamp · userId · sessionId · toolName · input · output · amount · approvalStatus · ipAddress`

---

## 🏆 Hackathon Track Alignment

| Track 01 Criterion | Our Implementation |
|---|---|
| **Agentic AI** | Gemini function-calling with 8 tools, multi-turn context |
| **Revenue growth** | Upsell/cross-sell tracked separately in merchant dashboard |
| **Real payment** | Full Razorpay TEST MODE: create → verify → order |
| **Transparency** | Every recommendation has an explicit reason |
| **Safety** | 8 enforced guardrails, zero autonomous charging |
| **Auditability** | Immutable MongoDB audit trail with full JSON payloads |
| **E2E flow** | Chat → cart → checkout → payment → success → dashboard |
| **Graceful failure** | No auto-retry, failure logged, user redirected cleanly |
| **Production polish** | Dark glassmorphism UI, Framer Motion, mobile responsive |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion |
| State | React Context (Auth + Cart) |
| HTTP Client | Axios with JWT interceptor |
| Charts | Recharts |
| Icons | Lucide React |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT + bcryptjs |
| AI | Google Gemini (`gemini-flash-lite`) + rule-based fallback |
| Payment | Razorpay Node SDK (TEST MODE) |
| Logging | Custom AuditService → MongoDB |

---

## 🔗 API Reference

<details>
<summary><b>Auth</b></summary>

| Method | Endpoint | Auth | Body |
|--------|----------|------|------|
| POST | `/api/auth/register` | — | `{name, email, password}` |
| POST | `/api/auth/login` | — | `{email, password}` |
| GET | `/api/auth/me` | JWT | — |

</details>

<details>
<summary><b>Products</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List with `?q=&category=&minPrice=&maxPrice=` |
| GET | `/api/products/categories` | Unique category list |
| GET | `/api/products/:id` | Product detail |
| GET | `/api/products/:id/recommendations` | Upsell/cross-sell |

</details>

<details>
<summary><b>Cart</b></summary>

| Method | Endpoint | Body |
|--------|----------|------|
| GET | `/api/cart` | — |
| POST | `/api/cart/add` | `{productId, quantity}` |
| DELETE | `/api/cart/remove/:productId` | — |
| PUT | `/api/cart/quantity` | `{productId, quantity}` |
| DELETE | `/api/cart/clear` | — |

</details>

<details>
<summary><b>AI Agent</b></summary>

| Method | Endpoint | Body |
|--------|----------|------|
| POST | `/api/agent/chat` | `{message, messages[], cartId, sessionId}` |

**Response:**
```json
{
  "success": true,
  "response": "AI text message",
  "products": [...],
  "recommendations": [...],
  "checkoutPreview": {...},
  "cartData": {...},
  "toolCalls": [{"name": "getProductRecommendations", "result": {...}}]
}
```

</details>

<details>
<summary><b>Payment</b></summary>

| Method | Endpoint | Body |
|--------|----------|------|
| POST | `/api/payment/create-order` | `{cartId}` |
| POST | `/api/payment/verify` | `{razorpayOrderId, razorpayPaymentId, razorpaySignature, cartId}` |
| POST | `/api/payment/failure` | `{razorpayOrderId, reason}` |
| GET | `/api/payment/status/:orderId` | — |

</details>

---

<div align="center">

**Built with ⚡ for Razorpay Hackathon — Track 01: AI Growth & Agentic Commerce**

*"The best AI is one that earns trust by being transparent, not by being invisible."*

</div>
