import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Zap, AlertTriangle, CheckCircle, Lock, Server, FileText, Fingerprint } from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const formatINR = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function Checkout() {
  const { user } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [approved, setApproved] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    loadPreview();
  }, []);

  const loadPreview = async () => {
    setLoading(true);
    try {
      const res = await api.get('/cart');
      const c = res.data.cart;
      setPreview({
        merchant: 'SportZone India',
        items: c.items?.map(item => ({
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity,
          addedViaAI: item.addedViaAI,
          recommendationReason: item.recommendationReason,
        })),
        pricing: {
          subtotal: c.subtotal,
          discount: c.discount,
          tax: c.tax,
          taxRate: c.taxRate || 18,
          total: c.total,
        },
        currency: 'INR',
      });
    } catch {
      toast.error('Failed to load checkout');
      navigate('/cart');
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    if (!approved) { toast.error('Please confirm the order details first'); return; }
    setPaying(true);
    try {
      const orderRes = await api.post('/payment/create-order', { cartId: cart?._id });
      const { razorpayOrderId, amount, currency, keyId } = orderRes.data;

      if (!keyId || keyId.includes('YOUR_KEY')) {
        toast.error('Configure RAZORPAY_KEY_ID in server/.env to process payments');
        setPaying(false);
        return;
      }

      const options = {
        key: keyId,
        amount,
        currency,
        name: 'SportZone India',
        description: 'AI Commerce Purchase',
        order_id: razorpayOrderId,
        prefill: { name: user.name, email: user.email },
        theme: { color: '#0ea5e9' },
        handler: async (response) => {
          const verifyRes = await api.post('/payment/verify', {
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            cartId: cart?._id,
          });
          toast.success('Payment successful!');
          navigate(`/payment/success?orderId=${verifyRes.data.orderId}`);
        },
        modal: {
          ondismiss: async () => {
            await api.post('/payment/failure', { razorpayOrderId, reason: 'User dismissed' });
            setPaying(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', async (r) => {
        await api.post('/payment/failure', { razorpayOrderId, reason: r.error.description });
        navigate(`/payment/failure?reason=${encodeURIComponent(r.error.description)}`);
      });
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
      setPaying(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-transparent pt-20 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="w-12 h-12 border-4 border-primary-900 border-t-primary-500 rounded-full animate-spin mb-4 relative z-10 shadow-[0_0_15px_rgba(14,165,233,0.3)]" />
      <p className="text-primary-400 font-mono text-sm tracking-widest uppercase relative z-10 animate-pulse">Establishing Secure Connection...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-transparent pt-24 pb-20 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary-900/5 rounded-full blur-[120px] pointer-events-none z-0" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-10">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-dark-900 border border-primary-500/30 mb-6 shadow-[0_0_20px_rgba(14,165,233,0.15)]">
            <Lock className="w-8 h-8 text-primary-400" />
          </motion.div>
          <motion.h1 initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-3xl md:text-4xl font-bold text-white tracking-wide">
            Secure Checkout Protocol
          </motion.h1>
          <motion.p initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-dark-400 mt-3 font-mono text-sm uppercase tracking-widest">
            Session Encrypted & Bounded
          </motion.p>
        </div>

        {preview && (
          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-6">
              <motion.div initial="hidden" animate="visible" variants={fadeUp} className="glass-panel p-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-dark-800">
                  <FileText className="w-5 h-5 text-primary-400" />
                  <h2 className="font-bold text-white text-lg">Transaction Manifest</h2>
                </div>
                
                <div className="space-y-4">
                  {preview.items?.map((item, i) => (
                    <div key={i} className="flex justify-between items-start py-3 border-b border-dark-800/50 last:border-0 group">
                      <div>
                        <p className="text-white font-medium group-hover:text-primary-200 transition-colors">{item.name}</p>
                        <p className="text-dark-400 text-sm mt-1 font-mono">Qty: {item.quantity} × {formatINR(item.unitPrice)}</p>
                        {item.addedViaAI && (
                          <div className="inline-flex items-center gap-1.5 mt-2 bg-accent-900/20 border border-accent-500/30 px-2 py-1 rounded">
                            <Zap className="w-3 h-3 text-accent-400" />
                            <span className="text-accent-400 text-[10px] font-bold uppercase tracking-wider">AI Upsell Verified</span>
                          </div>
                        )}
                        {item.recommendationReason && (
                          <p className="text-dark-500 text-xs italic mt-2 border-l-2 border-dark-700 pl-2">{item.recommendationReason}</p>
                        )}
                      </div>
                      <p className="font-mono text-white text-lg">{formatINR(item.totalPrice)}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.1 }} className="glass-panel p-6 border-amber-500/20 bg-amber-500/5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center flex-shrink-0 mt-1">
                    <Server className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-amber-400 font-bold tracking-wide">Server-Side Verification</h3>
                    <p className="text-amber-500/70 text-sm mt-2 leading-relaxed">
                      Pricing is calculated and locked on the server. The client cannot mutate the final charge amount. The AI agent operates in a strictly sandboxed environment and cannot initiate payments autonomously.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.2 }} className="glass-panel p-6 bg-dark-900/80">
                <h2 className="font-bold text-white mb-6 text-lg">Cryptographic Summary</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-dark-400">Merchant</span>
                    <span className="text-white font-medium bg-dark-800 px-3 py-1 rounded-md">{preview.merchant}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-dark-400">Subtotal</span>
                    <span className="text-white font-mono">{formatINR(preview.pricing?.subtotal || 0)}</span>
                  </div>
                  {preview.pricing?.discount > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-emerald-400">Discount</span>
                      <span className="text-emerald-400 font-mono">-{formatINR(preview.pricing.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-dark-400">GST ({preview.pricing?.taxRate}%)</span>
                    <span className="text-dark-300 font-mono">{formatINR(preview.pricing?.tax || 0)}</span>
                  </div>
                  
                  <div className="pt-4 border-t border-dark-800 mt-2">
                    <div className="flex justify-between items-end">
                      <span className="text-white font-bold">Total Authorized</span>
                      <span className="text-3xl font-black text-primary-400 font-mono">{formatINR(preview.pricing?.total || 0)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.3 }}>
                <div 
                  className={`glass-panel p-5 cursor-pointer transition-all duration-300 ${approved ? 'border-emerald-500/50 bg-emerald-900/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'border-dark-700 hover:border-primary-500/50'}`}
                  onClick={() => setApproved(!approved)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${approved ? 'border-emerald-400 bg-emerald-400' : 'border-dark-500'}`}>
                      {approved && <CheckCircle className="w-5 h-5 text-dark-950" />}
                    </div>
                    <div>
                      <p className={`font-bold transition-colors ${approved ? 'text-emerald-400' : 'text-white'}`}>Provide Explicit Consent</p>
                      <p className="text-dark-400 text-xs mt-1 font-mono uppercase tracking-wider">Test Mode — No Real Funds</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.button
                initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.4 }}
                onClick={handlePay}
                disabled={!approved || paying}
                className={`w-full py-5 text-lg font-bold rounded-xl flex items-center justify-center gap-3 transition-all duration-300 ${
                  approved && !paying 
                    ? 'bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white shadow-[0_0_20px_rgba(14,165,233,0.4)]' 
                    : 'bg-dark-800 text-dark-500 cursor-not-allowed border border-dark-700'
                }`}
              >
                {paying ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Fingerprint className="w-6 h-6" />
                    Sign & Execute Payment
                  </>
                )}
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
