import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Send, ShoppingCart, Zap, RefreshCw, Info, Fingerprint } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import RecommendationCard from '../components/RecommendationCard';
import PaymentConfirmModal from '../components/PaymentConfirmModal';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';



const formatINR = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

// Import uuid for session ID
function generateSessionId() {
  return 'sess_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
}

const QUICK_PROMPTS = [
  'Show me running shoes under ₹5000',
  'I need fitness gear for gym',
  'What electronics do you have?',
  'Show my cart',
  'I want to checkout',
];

export default function CustomerAgent() {
  const { user } = useAuth();
  const { cart, setCart, fetchCart, itemCount } = useCart();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `👋 Hi${user ? ' ' + user.name.split(' ')[0] : ''}! I'm your AI shopping assistant for **SportZone India**.\n\nI can help you:\n• 🔍 **Find products** — "Show me running shoes under ₹5000"\n• ✨ **Get recommendations** — personalized upsells\n• 🛒 **Manage your cart** — add or remove items\n• 💳 **Checkout** — with full price transparency\n\nWhat are you looking for today?`,
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => {
    let s = localStorage.getItem('sessionId');
    if (!s) { s = generateSessionId(); localStorage.setItem('sessionId', s); }
    return s;
  });
  const [checkoutPreview, setCheckoutPreview] = useState(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');

    const userMsg = { role: 'user', content: msg, timestamp: new Date() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await api.post('/agent/chat', {
        message: msg,
        messages: newMessages.slice(-10).map(m => ({ role: m.role, content: m.content })),
        cartId: cart?._id,
        sessionId,
      });

      const data = res.data;

      // Update cart if changed
      if (data.cartData) {
        setCart(data.cartData);
      }

      // Store checkout preview
      if (data.checkoutPreview) {
        setCheckoutPreview(data.checkoutPreview);
      }

      // Build assistant message
      const aiMsg = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        products: data.products,
        recommendations: data.recommendations,
        checkoutPreview: data.checkoutPreview,
        cartData: data.cartData,
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        isError: true,
      }]);
      toast.error('Failed to get AI response');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    if (!user) { navigate('/login'); return; }
    try {
      await api.post('/cart/add', {
        productId: product._id,
        quantity: 1,
      });
      await fetchCart();
      toast.success(`${product.name} added to cart!`);
      
      // Trigger AI to show recommendations
      sendMessage(`Please recommend products that go well with ${product.name}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  const handleRecommendationAdd = async (recommendation) => {
    if (!user) { navigate('/login'); return; }
    await api.post('/cart/add', {
      productId: recommendation._id,
      quantity: 1,
    });
    await fetchCart();
    toast.success(`${recommendation.name} added!`);
  };

  const handleCheckout = () => {
    if (!checkoutPreview) {
      sendMessage('Show me the checkout preview');
      return;
    }
    setShowPayModal(true);
  };

  const handlePaymentConfirm = async () => {
    if (!user) { navigate('/login'); return; }
    setPayLoading(true);
    try {
      // Create Razorpay order server-side
      const orderRes = await api.post('/payment/create-order', { cartId: cart?._id });
      const { razorpayOrderId, amount, currency, keyId } = orderRes.data;

      setShowPayModal(false);

      // Check if Razorpay is configured
      if (!keyId || keyId === 'rzp_test_YOUR_KEY_ID') {
        toast.error('Razorpay credentials not configured. Please add your keys to server/.env');
        setPayLoading(false);
        return;
      }

      // Open Razorpay checkout
      const options = {
        key: keyId,
        amount,
        currency,
        name: 'SportZone India',
        description: 'AI Commerce Agent Purchase',
        order_id: razorpayOrderId,
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: { color: '#0ea5e9' }, // Cyan
        handler: async (response) => {
          try {
            // Verify payment server-side
            const verifyRes = await api.post('/payment/verify', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              cartId: cart?._id,
            });
            toast.success('Payment successful! 🎉');
            navigate(`/payment/success?orderId=${verifyRes.data.orderId}&orderNumber=${verifyRes.data.orderNumber}`);
          } catch (err) {
            toast.error('Payment verification failed');
            navigate('/payment/failure?reason=verification_failed');
          }
        },
        modal: {
          ondismiss: async () => {
            await api.post('/payment/failure', {
              razorpayOrderId,
              reason: 'User dismissed the payment window',
            });
            toast.error('Payment cancelled');
            setPayLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', async (response) => {
        await api.post('/payment/failure', {
          razorpayOrderId,
          reason: response.error.description,
          code: response.error.code,
        });
        navigate(`/payment/failure?reason=${encodeURIComponent(response.error.description)}`);
      });
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create order');
    } finally {
      setPayLoading(false);
    }
  };

  const renderMessageContent = (msg) => {
    // Convert markdown-like bold to actual elements
    const parts = msg.content.split(/\*\*(.*?)\*\*/g);
    return (
      <div className="space-y-4">
        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          {parts.map((part, i) =>
            i % 2 === 1 ? <strong key={i} className="font-semibold text-white">{part}</strong> : part
          )}
        </div>
        {/* Products grid */}
        {msg.products && msg.products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {msg.products.slice(0, 4).map((p) => (
              <ProductCard
                key={p._id}
                product={p}
                compact
                onAddToCart={handleAddToCart}
                onView={(p) => navigate(`/product/${p._id}`)}
              />
            ))}
          </div>
        )}
        {/* Recommendations */}
        {msg.recommendations && msg.recommendations.length > 0 && (
          <div className="space-y-3 mt-5 p-4 rounded-xl border border-primary-500/20 bg-primary-900/10">
            <p className="text-xs text-primary-400 font-semibold uppercase tracking-widest flex items-center gap-2">
              <Zap className="w-3 h-3" /> AI Upsell Recommendations
            </p>
            {msg.recommendations.slice(0, 3).map((rec) => (
              <RecommendationCard
                key={rec._id}
                recommendation={rec}
                onAddToCart={handleRecommendationAdd}
              />
            ))}
          </div>
        )}
        {/* Checkout preview CTA */}
        {msg.checkoutPreview && (
          <button
            onClick={() => { setCheckoutPreview(msg.checkoutPreview); setShowPayModal(true); }}
            className="btn-primary w-full mt-4 flex items-center justify-center gap-2 pay-btn-glow text-lg py-4"
          >
            <Fingerprint className="w-5 h-5" />
            Authorize {formatINR(msg.checkoutPreview.pricing?.total)}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen pt-16 flex flex-col lg:flex-row bg-transparent relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary-900/10 rounded-full blur-[100px] pointer-events-none z-0" />
      
      {/* Chat Area */}
      <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] relative z-10">
        {/* Header */}
        <div className="glass-panel rounded-none border-t-0 border-x-0 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center shadow-[0_0_15px_rgba(14,165,233,0.3)]">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white text-lg tracking-wide">RazorPay Commerce Agent</h1>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-primary-300 text-xs font-mono uppercase tracking-widest">Protocol Active</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCart(!showCart)}
              className="relative btn-secondary text-sm py-2 flex items-center gap-2 lg:hidden"
            >
              <ShoppingCart className="w-4 h-4" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {itemCount}
                </span>
              )}
            </button>
            <button onClick={() => { setMessages([messages[0]]); setCheckoutPreview(null); }} className="btn-secondary text-sm py-2 flex items-center gap-2 border-dark-700 hover:border-primary-500/50 hover:text-primary-300">
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Reset Session</span>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                key={idx} 
                className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-10 h-10 rounded-xl bg-dark-900 border border-primary-500/30 flex items-center justify-center flex-shrink-0 mt-1 shadow-[0_0_10px_rgba(14,165,233,0.1)]">
                    <Bot className="w-5 h-5 text-primary-400" />
                  </div>
                )}
                <div className={msg.role === 'assistant' ? 'ai-bubble bg-dark-900/80 border-primary-900/50 shadow-lg shadow-black/20' : 'user-bubble bg-primary-900/20 border-primary-500/30 shadow-lg shadow-primary-900/10'}>
                  {msg.role === 'assistant' ? renderMessageContent(msg) : (
                    <p className="text-sm text-primary-50">{msg.content}</p>
                  )}
                  <p className="text-dark-500 text-[10px] font-mono mt-3 uppercase tracking-wider text-right">
                    {msg.timestamp?.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {msg.role === 'user' && (
                  <div className="w-10 h-10 rounded-xl bg-dark-800 border border-dark-600 flex items-center justify-center flex-shrink-0 mt-1 text-dark-300 font-bold text-sm">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-dark-900 border border-primary-500/30 flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(14,165,233,0.1)]">
                <Bot className="w-5 h-5 text-primary-400" />
              </div>
              <div className="ai-bubble bg-dark-900/80 border-primary-900/50">
                <div className="flex gap-1.5 py-2 px-1">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>

        {/* Quick prompts */}
        <div className="px-6 pb-3">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                className="flex-shrink-0 text-xs bg-dark-900/80 hover:bg-primary-900/30 border border-dark-700 hover:border-primary-500/50 text-dark-300 hover:text-primary-200 rounded-lg px-4 py-2 transition-all duration-300"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-6 pt-0">
          <div className="flex gap-3 glass-panel rounded-2xl p-2 border-primary-500/20">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Query the commerce agent..."
              className="flex-1 bg-transparent text-white placeholder-dark-500 text-sm focus:outline-none px-4 font-medium"
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 disabled:from-dark-800 disabled:to-dark-800 text-white disabled:text-dark-600 rounded-xl p-3 transition-all duration-300 shadow-[0_0_15px_rgba(14,165,233,0.3)] disabled:shadow-none"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-center text-dark-500 text-[10px] uppercase tracking-widest font-mono mt-3">
            <Info className="w-3 h-3 inline mr-1 -mt-0.5" />
            Agent operates in sandboxed mode. Explicit authorization required for transactions.
          </p>
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className={`${showCart ? 'block absolute z-20 inset-y-0 right-0 shadow-2xl shadow-black' : 'hidden'} lg:block w-full lg:w-96 glass-panel rounded-none border-y-0 border-r-0 border-l-dark-800 h-[calc(100vh-4rem)] overflow-y-auto`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-dark-800">
            <h2 className="font-bold text-white flex items-center gap-3 text-lg">
              <ShoppingCart className="w-5 h-5 text-primary-400" />
              Active Session Cart
              {itemCount > 0 && <span className="bg-primary-500/20 text-primary-300 border border-primary-500/30 rounded-full px-2 py-0.5 text-xs">{itemCount}</span>}
            </h2>
            {showCart && (
              <button onClick={() => setShowCart(false)} className="lg:hidden text-dark-400 hover:text-white">✕</button>
            )}
          </div>

          {!cart || cart.items?.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-dark-900 border border-dark-800 flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-6 h-6 text-dark-600" />
              </div>
              <p className="text-dark-300 text-sm font-medium">Cart is empty</p>
              <p className="text-dark-500 text-xs mt-2 font-mono">Awaiting agent instructions...</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {cart.items.map((item, idx) => (
                  <div key={idx} className="glass-strong rounded-xl p-3 border-dark-700 hover:border-primary-500/30 transition-colors">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-dark-900 flex-shrink-0 border border-dark-800">
                        <img src={item.image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100'} alt={item.name} className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100'; }} />
                      </div>
                      <div className="flex-1 min-w-0 py-1">
                        <p className="text-primary-50 text-sm font-medium line-clamp-1">{item.name}</p>
                        <p className="text-primary-400 text-sm font-bold mt-1">{formatINR(item.price)} <span className="text-dark-500 font-normal text-xs">× {item.quantity}</span></p>
                        {item.addedViaAI && <span className="inline-block mt-1.5 text-[10px] font-mono text-accent-400 border border-accent-500/30 bg-accent-900/20 px-1.5 py-0.5 rounded">AI Upsell</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="bg-transparent/50 border border-dark-800 rounded-xl p-5 space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-dark-400">Subtotal</span>
                  <span className="text-white font-mono">{formatINR(cart.subtotal || 0)}</span>
                </div>
                {cart.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-400">Discount</span>
                    <span className="text-emerald-400 font-mono">-{formatINR(cart.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-dark-400">GST (18%)</span>
                  <span className="text-dark-300 font-mono">{formatINR(cart.tax || 0)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-3 border-t border-dark-800 mt-2">
                  <span className="text-white">Total</span>
                  <span className="text-primary-400 font-mono">{formatINR(cart.total || 0)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="btn-accent w-full flex items-center justify-center gap-2 pay-btn-glow py-4 text-base"
              >
                <Fingerprint className="w-5 h-5" />
                Proceed to Verification
              </button>
            </>
          )}
        </div>
      </div>

      {/* Payment Confirm Modal */}
      {showPayModal && (
        <PaymentConfirmModal
          preview={checkoutPreview}
          onConfirm={handlePaymentConfirm}
          onCancel={() => setShowPayModal(false)}
          loading={payLoading}
        />
      )}
    </div>
  );
}
