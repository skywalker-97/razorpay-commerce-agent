import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Star, Plus, Minus } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const formatINR = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export default function MerchantProducts() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || (user.role !== 'merchant' && user.role !== 'admin')) { navigate('/login'); return; }
    api.get('/merchant/products').then(res => setProducts(res.data.products)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3"><Package className="w-8 h-8 text-primary-400" />Products</h1>
            <p className="text-dark-400 mt-1">{products.length} products in your store</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <div key={i} className="card shimmer h-64" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-dark-500 text-xs uppercase tracking-wide border-b border-dark-700">
                  <th className="text-left py-3 pr-4">Product</th>
                  <th className="text-left py-3 pr-4">Category</th>
                  <th className="text-left py-3 pr-4">Price</th>
                  <th className="text-left py-3 pr-4">Stock</th>
                  <th className="text-left py-3 pr-4">Rating</th>
                  <th className="text-left py-3">Sales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-dark-800/30 transition-colors cursor-pointer"
                    onClick={() => navigate(`/product/${p._id}`)}>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-dark-700 flex-shrink-0">
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100'; }} />
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{p.name}</p>
                          {p.isFeatured && <span className="badge-primary text-xs">Featured</span>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-dark-300 text-sm">{p.category}</td>
                    <td className="py-3 pr-4 font-bold text-white text-sm">{formatINR(p.price)}</td>
                    <td className="py-3 pr-4">
                      <span className={`text-sm font-medium ${p.stock > 10 ? 'text-emerald-400' : p.stock > 0 ? 'text-amber-400' : 'text-red-400'}`}>
                        {p.stock > 0 ? p.stock : 'Out'}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-white text-sm">{p.rating}</span>
                      </div>
                    </td>
                    <td className="py-3 text-dark-300 text-sm">{p.salesCount || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
