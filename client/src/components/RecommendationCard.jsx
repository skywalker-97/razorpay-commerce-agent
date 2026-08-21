import { ShoppingCart, Sparkles, Plus, Check } from 'lucide-react';
import { useState } from 'react';

const formatINR = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export default function RecommendationCard({ recommendation, onAddToCart }) {
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (added || loading) return;
    setLoading(true);
    try {
      await onAddToCart(recommendation);
      setAdded(true);
      setTimeout(() => setAdded(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  const typeLabel = recommendation.type === 'upsell' ? 'Upsell Offer' 
    : recommendation.type === 'cross-sell' ? 'Frequently Bought Together' 
    : 'Related Product';

  const typeColor = recommendation.type === 'upsell'
    ? 'from-amber-900/40 to-dark-800 border-amber-700/30'
    : 'from-primary-900/40 to-dark-800 border-primary-700/30';

  return (
    <div className={`bg-gradient-to-br ${typeColor} border rounded-2xl p-4 animate-slide-in-right`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <span className="text-xs font-semibold text-amber-400 uppercase tracking-wide">{typeLabel}</span>
      </div>

      {/* Product */}
      <div className="flex gap-3 items-start">
        <div className="w-16 h-16 rounded-xl overflow-hidden bg-dark-700 flex-shrink-0">
          <img
            src={recommendation.image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100'}
            alt={recommendation.name}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100'; }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-white text-sm line-clamp-1">{recommendation.name}</h4>
          <p className="text-primary-400 font-bold text-base">{formatINR(recommendation.price)}</p>
          <p className="text-dark-400 text-xs line-clamp-2 mt-1">{recommendation.reason}</p>
        </div>
      </div>

      {/* Add to cart */}
      <button
        onClick={handleAdd}
        disabled={loading || added}
        className={`mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
          added
            ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30'
            : 'bg-primary-600 hover:bg-primary-500 text-white active:scale-95'
        }`}
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : added ? (
          <><Check className="w-4 h-4" /> Added to Cart!</>
        ) : (
          <><Plus className="w-4 h-4" /> Add to Cart</>
        )}
      </button>
    </div>
  );
}
