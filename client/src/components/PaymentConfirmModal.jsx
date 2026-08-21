import { Shield, AlertTriangle, CheckCircle, X } from 'lucide-react';

const formatINR = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export default function PaymentConfirmModal({ preview, onConfirm, onCancel, loading }) {
  if (!preview) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-sm animate-fade-in">
      <div className="glass-strong rounded-3xl w-full max-w-md shadow-2xl border border-dark-600/60 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="font-bold text-white text-lg">Confirm Payment</h2>
              <p className="text-dark-400 text-xs">Your explicit approval is required</p>
            </div>
          </div>
          <button onClick={onCancel} className="text-dark-400 hover:text-white p-1 rounded-lg hover:bg-dark-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Merchant */}
          <div className="bg-dark-800/60 rounded-xl p-3">
            <p className="text-dark-400 text-xs mb-1">Merchant</p>
            <p className="font-semibold text-white">{preview.merchant || 'SportZone India'}</p>
          </div>

          {/* Items */}
          <div>
            <p className="text-dark-400 text-xs mb-2 font-medium">ORDER ITEMS</p>
            <div className="space-y-2">
              {preview.items?.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-dark-700/50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium line-clamp-1">{item.name}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-dark-400 text-xs">Qty: {item.quantity}</p>
                      {item.addedViaAI && (
                        <span className="badge-primary text-xs">AI Recommended</span>
                      )}
                    </div>
                    {item.recommendationReason && (
                      <p className="text-primary-400 text-xs mt-0.5 italic">{item.recommendationReason}</p>
                    )}
                  </div>
                  <p className="font-semibold text-white ml-3">{formatINR(item.totalPrice)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing breakdown */}
          <div className="bg-dark-800/60 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-dark-400">Subtotal</span>
              <span className="text-white">{formatINR(preview.pricing?.subtotal || 0)}</span>
            </div>
            {preview.pricing?.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-emerald-400">Discount</span>
                <span className="text-emerald-400">-{formatINR(preview.pricing.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-dark-400">GST ({preview.pricing?.taxRate || 18}%)</span>
              <span className="text-white">{formatINR(preview.pricing?.tax || 0)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-dark-600">
              <span className="text-white">Total</span>
              <span className="text-primary-400">{formatINR(preview.pricing?.total || 0)}</span>
            </div>
          </div>

          {/* Payment method */}
          <div className="flex items-center gap-2 bg-dark-800/40 rounded-xl p-3">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <p className="text-dark-300 text-xs">Payment via: UPI / Card / Net Banking (Razorpay TEST MODE)</p>
          </div>

          {/* Safety warning */}
          <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-amber-300 text-xs">This is a TEST MODE payment. No real money will be charged.</p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 pt-0 flex gap-3">
          <button onClick={onCancel} className="btn-secondary flex-1">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="btn-primary flex-1 pay-btn-glow flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Shield className="w-4 h-4" />
                Confirm & Pay {formatINR(preview.pricing?.total || 0)}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
