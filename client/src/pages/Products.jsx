import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Grid, List } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Products() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('-createdAt');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [search, selectedCategory, maxPrice, sortBy, page]);

  const fetchCategories = async () => {
    const res = await api.get('/products/categories');
    setCategories(res.data.categories);
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12, sort: sortBy };
      if (search) params.q = search;
      if (selectedCategory) params.category = selectedCategory;
      if (maxPrice) params.maxPrice = maxPrice;
      const res = await api.get('/products', { params });
      setProducts(res.data.products);
      setTotalPages(res.data.pages);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    if (!user) { navigate('/login'); return; }
    try {
      await addToCart(product._id, 1);
      toast.success(`${product.name} added to cart!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Products</h1>
          <p className="text-dark-400">Browse our curated sports & fitness collection</p>
        </div>

        {/* Filters */}
        <div className="glass rounded-2xl p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
              <input
                type="text"
                className="input pl-9 py-2"
                placeholder="Search products..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <select
              className="input py-2 w-full sm:w-44"
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input
              type="number"
              className="input py-2 w-full sm:w-36"
              placeholder="Max price ₹"
              value={maxPrice}
              onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
            />
            <select
              className="input py-2 w-full sm:w-40"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="-createdAt">Newest</option>
              <option value="price">Price: Low</option>
              <option value="-price">Price: High</option>
              <option value="-rating">Top Rated</option>
              <option value="-salesCount">Best Selling</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card p-0 overflow-hidden">
                <div className="shimmer h-48" />
                <div className="p-4 space-y-2">
                  <div className="shimmer h-4 rounded" />
                  <div className="shimmer h-4 rounded w-3/4" />
                  <div className="shimmer h-6 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-white mb-2">No products found</h3>
            <p className="text-dark-400">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={handleAddToCart}
                onView={(p) => navigate(`/product/${p._id}`)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                  page === i + 1 ? 'btn-primary py-0' : 'btn-secondary py-0'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
