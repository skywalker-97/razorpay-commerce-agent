import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight, Zap, Download, ShieldCheck, Activity } from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';

const formatINR = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { fetchCart } = useCart();
  const [order, setOrder] = useState(null);
  const orderId = searchParams.get('orderId');
  const orderNumber = searchParams.get('orderNumber');

  useEffect(() => {
    fetchCart(); // Refresh cart
    if (orderId) {
      api.get(`/orders/${orderId}`).then(res => setOrder(res.data.order)).catch(() => {});
    }
  }, []);

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center px-4 bg-transparent relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none z-0" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full text-center relative z-10"
      >
        {/* Success Icon */}
        <div className="relative mb-8 flex justify-center">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 12, delay: 0.2 }}
            className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center relative z-10 shadow-[0_0_30px_rgba(16,185,129,0.2)]"
          >
            <div className="absolute inset-0 rounded-full border-t border-emerald-500/50 animate-spin-slow" style={{ animationDuration: '3s' }} />
            <CheckCircle className="w-12 h-12 text-emerald-400" />
          </motion.div>
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 1 }}
            className="absolute inset-0 w-24 h-24 mx-auto rounded-full border border-emerald-500/30 pointer-events-none" 
          />
        </div>

        <h1 className="text-4xl font-black text-white mb-2 tracking-wide">Transaction Verified</h1>
        <p className="text-dark-400 text-lg mb-4 font-mono">Status code: PAYMENT_SUCCESS</p>

        {orderNumber && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="inline-flex items-center gap-2 bg-emerald-900/30 text-emerald-400 border border-emerald-500/30 px-4 py-1.5 rounded-full text-xs font-mono font-bold tracking-widest uppercase mb-8 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
          >
            <ShieldCheck className="w-4 h-4" />
            TX Hash: {orderNumber}
          </motion.div>
        )}

        {/* Order details */}
        {order && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-panel p-6 mb-8 text-left border-dark-800"
          >
            <h2 className="font-bold text-white mb-5 flex items-center gap-2 text-sm uppercase tracking-widest border-b border-dark-800 pb-3">
              <Activity className="w-4 h-4 text-primary-400" />
              Cryptographic Summary
            </h2>
            <div className="space-y-3 font-mono text-sm">
              {order.items?.map((item, i) => (
                <div key={i} className="flex justify-between items-center bg-dark-900/50 p-2 rounded">
                  <span className="text-dark-300 flex-1">{item.name} <span className="text-dark-500 text-xs px-2">x{item.quantity}</span></span>
                  <span className="text-white font-medium">{formatINR(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="mt-4 pt-4 border-t border-dark-800 flex justify-between items-center">
                <span className="text-dark-400 uppercase tracking-widest text-xs font-bold">Total Settled</span>
                <span className="text-emerald-400 text-xl font-bold shadow-emerald-500/20 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">{formatINR(order.total)}</span>
              </div>
            </div>
            
            {order.isAIAssisted && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-5 flex items-start gap-3 bg-primary-900/10 border border-primary-500/20 rounded-xl p-4 relative overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500" />
                <Zap className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white text-sm font-bold uppercase tracking-wider mb-1">AI Agent Acceleration</p>
                  <p className="text-primary-300/80 text-xs leading-relaxed">
                    Agent successfully negotiated and bundled products. Upsell value realized: <span className="text-white font-mono">{formatINR(order.upsellAmount)}</span>
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button onClick={() => navigate('/customer')} className="flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold bg-primary-600 hover:bg-primary-500 text-white transition-all shadow-[0_0_20px_rgba(14,165,233,0.3)]">
            <Zap className="w-4 h-4" />
            Initialize New Session
            <ArrowRight className="w-4 h-4" />
          </button>
          <button onClick={() => navigate('/merchant/audit-logs')} className="flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-semibold bg-dark-900 border border-dark-700 text-white hover:bg-dark-800 hover:border-primary-500/50 hover:text-primary-300 transition-colors">
            View Immutable Ledger
          </button>
        </motion.div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-dark-500 text-xs mt-10 font-mono"
        >
          TEST MODE · No real fiat was transacted · Protocol secured by Razorpay
        </motion.p>
      </motion.div>
    </div>
  );
}
