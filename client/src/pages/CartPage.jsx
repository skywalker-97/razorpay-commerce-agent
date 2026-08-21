import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, Zap, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const formatINR = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export default function Cart() {
  const { user } = useAuth();
  const { cart, loading, removeFromCart, updateQuantity, fetchCart } = useCart();
  const navigate = useNavigate();
  const [removing, setRemoving] = useState(null);
  const [updating, setUpdating] = useState(null); // tracks which productId is being qty-updated

  // Safely extract string ID from item.productId (could be ObjectId object or string)
  const getProductId = (item) => {
    const pid = item.productId;
    if (!pid) return null;
    if (typeof pid === 'string') return pid;
    if (typeof pid === 'object' && pid._id) return pid._id.toString();
    return pid.toString();
  };

  useEffect(() => { if (user) fetchCart(); }, []);

  const handleRemove = async (item) => {
    const productId = getProductId(item);
    if (!productId) return;
    setRemoving(productId);
    try {
      await removeFromCart(productId);
      toast.success('Item removed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove item');
    } finally {
      setRemoving(null);
    }
  };

  const handleQty = async (item, qty) => {
    const productId = getProductId(item);
    if (!productId) return;
    if (qty < 1) { handleRemove(item); return; }
    setUpdating(productId);
    try {
      await updateQuantity(productId, qty);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update quantity');
    } finally {
      setUpdating(null);
    }
  };

  if (!user) return (
    <div className="min-h-screen pt-20 flex items-center justify-center">
      <div className="text-center">
        <ShoppingCart className="w-16 h-16 text-dark-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Login to view cart</h2>
        <button onClick={() => navigate('/login')} className="btn-primary mt-4">Sign In</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
          <ShoppingCart className="w-8 h-8 text-primary-400" />
          Shopping Cart
          {cart?.items?.length > 0 && (
            <span className="badge-primary text-sm">{cart.items.length} items</span>
          )}
        </h1>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <div key={i} className="card shimmer h-24" />)}
          </div>
        ) : !cart || cart.items?.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingCart className="w-20 h-20 text-dark-700 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Your cart is empty</h2>
            <p className="text-dark-400 mb-8">Add some products or let AI help you find what you need!</p>
            <div className="flex justify-center gap-4">
              <button onClick={() => navigate('/products')} className="btn-secondary">Browse Products</button>
              <button onClick={() => navigate('/customer')} className="btn-primary flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Ask AI Agent
              </button>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => {
                const pid = getProductId(item);
                const isRemoving = removing === pid;
                const isUpdating = updating === pid;
                return (
                  <div key={pid || item.name} className="card flex gap-4 transition-opacity duration-200" style={{ opacity: isRemoving ? 0.4 : 1 }}>
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-dark-700 flex-shrink-0">
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100'}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100'; }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white line-clamp-2">{item.name}</h3>
                      <p className="text-primary-400 font-bold text-lg">{formatINR(item.price)}</p>
                      {item.addedViaAI && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <Zap className="w-3 h-3 text-amber-400" />
                          <span className="text-xs text-amber-400">AI Recommended</span>
                          {item.recommendationReason && (
                            <span className="text-dark-500 text-xs">· {item.recommendationReason}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end justify-between gap-2">
                      {/* Delete button */}
                      <button
                        onClick={() => handleRemove(item)}
                        disabled={isRemoving}
                        className="text-dark-500 hover:text-red-400 disabled:opacity-40 transition-colors p-1"
                        title="Remove item"
                      >
                        {isRemoving
                          ? <div className="w-4 h-4 border-2 border-red-400/40 border-t-red-400 rounded-full animate-spin" />
                          : <Trash2 className="w-4 h-4" />
                        }
                      </button>
                      {/* Qty stepper */}
                      <div className="flex items-center glass rounded-xl overflow-hidden">
                        <button
                          onClick={() => handleQty(item, item.quantity - 1)}
                          disabled={isUpdating || isRemoving}
                          className="px-3 py-2 text-dark-300 hover:text-white hover:bg-dark-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          {isUpdating && item.quantity > 1
                            ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            : <Minus className="w-3 h-3" />
                          }
                        </button>
                        <span className="px-3 text-white text-sm font-semibold min-w-[1.5rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQty(item, item.quantity + 1)}
                          disabled={isUpdating || isRemoving}
                          className="px-3 py-2 text-dark-300 hover:text-white hover:bg-dark-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          {isUpdating
                            ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            : <Plus className="w-3 h-3" />
                          }
                        </button>
                      </div>
                      <p className="font-bold text-white">{formatINR(item.price * item.quantity)}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="card self-start">
              <h2 className="font-bold text-white text-lg mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-dark-400">Subtotal</span>
                  <span className="text-white">{formatINR(cart.subtotal || 0)}</span>
                </div>
                {cart.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-emerald-400">Discount</span>
                    <span className="text-emerald-400">-{formatINR(cart.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-dark-400">GST (18%)</span>
                  <span className="text-white">{formatINR(cart.tax || 0)}</span>
                </div>
                <div className="border-t border-dark-700 pt-3 flex justify-between font-bold text-xl">
                  <span className="text-white">Total</span>
                  <span className="text-primary-400">{formatINR(cart.total || 0)}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="btn-accent w-full flex items-center justify-center gap-2 pay-btn-glow"
              >
                <Zap className="w-4 h-4" />
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </button>

              <button onClick={() => navigate('/products')} className="btn-secondary w-full mt-3 text-sm">
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
