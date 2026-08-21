import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, ArrowLeft, Zap, Package, Shield } from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import RecommendationCard from '../components/RecommendationCard';
import toast from 'react-hot-toast';

const formatINR = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [pRes, rRes] = await Promise.all([
          api.get(`/products/${id}`),
          api.get(`/products/${id}/recommendations`),
        ]);
        setProduct(pRes.data.product);
        setRecommendations(rRes.data.recommendations || []);
      } catch (err) {
        toast.error('Product not found');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      await addToCart(product._id, qty);
      toast.success(`${product.name} added to cart!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  if (loading) return (
    <div className="min-h-screen pt-20 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!product) return null;

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-dark-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Image */}
          <div className="relative">
            <div className="glass rounded-3xl overflow-hidden aspect-square">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'; }}
              />
            </div>
            {discount > 0 && (
              <div className="absolute top-4 left-4 bg-accent-500 text-white text-sm font-bold px-3 py-1.5 rounded-xl">
                {discount}% OFF
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <span className="badge-primary mb-2">{product.category}</span>
              <h1 className="text-3xl font-bold text-white mb-2">{product.name}</h1>
              {product.brand && <p className="text-dark-400 text-sm">by {product.brand}</p>}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-dark-600'}`} />
                ))}
              </div>
              <span className="font-semibold text-white">{product.rating}</span>
              <span className="text-dark-500 text-sm">({product.reviewCount} reviews)</span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-4xl font-black text-white">{formatINR(product.price)}</span>
              {product.originalPrice && (
                <span className="text-dark-500 text-xl line-through">{formatINR(product.originalPrice)}</span>
              )}
            </div>

            <p className="text-dark-300 leading-relaxed">{product.description}</p>

            {/* Specs */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="glass rounded-2xl p-4">
                <h3 className="font-semibold text-white mb-3 text-sm uppercase tracking-wide">Specifications</h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(product.specifications).map(([key, val]) => (
                    <div key={key}>
                      <p className="text-dark-500 text-xs capitalize">{key}</p>
                      <p className="text-white text-sm font-medium">{String(val)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stock */}
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 text-sm font-medium">
                {product.stock > 10 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left!` : 'Out of Stock'}
              </span>
            </div>

            {/* Quantity + Add to Cart */}
            {product.stock > 0 && (
              <div className="flex gap-4 items-center">
                <div className="flex items-center glass rounded-xl overflow-hidden">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-4 py-3 text-dark-300 hover:text-white hover:bg-dark-700 transition-colors font-bold">-</button>
                  <span className="px-4 text-white font-semibold">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="px-4 py-3 text-dark-300 hover:text-white hover:bg-dark-700 transition-colors font-bold">+</button>
                </div>
                <button onClick={handleAddToCart} className="btn-primary flex-1 flex items-center justify-center gap-2 py-3">
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </button>
              </div>
            )}

            <div className="flex items-center gap-2 bg-dark-800/40 rounded-xl p-3">
              <Shield className="w-4 h-4 text-primary-400" />
              <p className="text-dark-400 text-xs">Secure checkout via Razorpay · TEST MODE · No real charges</p>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Zap className="w-6 h-6 text-primary-400" />
              AI Recommendations
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recommendations.map((rec) => (
                <RecommendationCard
                  key={rec._id}
                  recommendation={rec}
                  onAddToCart={async (r) => {
                    if (!user) { navigate('/login'); return; }
                    await addToCart(r._id, 1);
                    toast.success(`${r.name} added!`);
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
