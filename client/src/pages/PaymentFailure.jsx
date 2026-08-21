import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, AlertTriangle, RefreshCw, ArrowLeft, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PaymentFailure() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const reason = searchParams.get('reason') || 'Payment was not completed';

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center px-4 bg-transparent relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-900/10 rounded-full blur-[120px] pointer-events-none z-0" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full text-center relative z-10"
      >
        {/* Failure Icon */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 12, delay: 0.2 }}
          className="w-24 h-24 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-8 relative shadow-[0_0_30px_rgba(239,68,68,0.2)]"
        >
          <div className="absolute inset-0 rounded-full border-t border-red-500/50 animate-spin-slow" style={{ animationDuration: '3s' }} />
          <XCircle className="w-12 h-12 text-red-400 relative z-10" />
        </motion.div>

        <h1 className="text-4xl font-black text-white mb-2 tracking-wide">Transaction Denied</h1>
        <p className="text-dark-400 text-lg mb-8 font-mono">Status code: PAYMENT_FAILED</p>

        {/* Critical safety message */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-panel p-6 mb-6 border-red-500/30 bg-red-950/20 shadow-[0_0_15px_rgba(239,68,68,0.1)] relative overflow-hidden text-left"
        >
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />
          <div className="flex items-start gap-4">
            <ShieldAlert className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white mb-1 uppercase tracking-wider text-sm">Security Guardrail Active</p>
              <p className="text-dark-300 text-sm leading-relaxed">
                <span className="text-white font-semibold">No automatic retry</span> was initiated.
                The payment vector was closed. No funds were deducted from your account.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Reason */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-panel p-5 mb-8 text-left border-dark-800"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-dark-500 text-xs mb-1 uppercase tracking-widest font-bold">Failure Vector</p>
              <p className="text-white text-sm font-medium">{decodeURIComponent(reason)}</p>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          <button
            onClick={() => navigate('/checkout')}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold bg-dark-900 border border-dark-700 text-white hover:bg-dark-800 hover:border-red-500/50 hover:text-red-400 transition-all shadow-lg"
          >
            <RefreshCw className="w-4 h-4" />
            Re-Initialize Vector
          </button>
          <button
            onClick={() => navigate('/cart')}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold bg-transparent text-dark-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Cart
          </button>
        </motion.div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-dark-500 text-xs mt-10 font-mono"
        >
          Event logged in cryptographic audit trail. TEST MODE — no real fiat involved.
        </motion.p>
      </motion.div>
    </div>
  );
}
