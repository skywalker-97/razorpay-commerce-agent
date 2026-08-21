import { ShoppingCart, Plus, Star, Zap } from 'lucide-react';

const formatINR = (amount) => 
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export default function ProductCard({ product, onAddToCart, onView, compact = false }) {
  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="product-card" onClick={() => onView?.(product)}>
      {/* Image */}
      <div className={`relative overflow-hidden ${compact ? 'h-36' : 'h-52'} bg-dark-800`}>
        <img
          src={product.image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'; }}
        />
        {discount > 0 && (
          <div className="absolute top-2 left-2 bg-accent-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
            -{discount}%
          </div>
        )}
        {product.isFeatured && (
          <div className="absolute top-2 right-2 bg-primary-500/90 text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Featured
          </div>
        )}
        {product.stock <= 5 && product.stock > 0 && (
          <div className="absolute bottom-2 left-2 bg-amber-500/90 text-white text-xs font-bold px-2 py-1 rounded-lg">
            Only {product.stock} left!
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-dark-900/70 flex items-center justify-center">
            <span className="text-dark-300 font-semibold">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-1">
          <span className="text-xs text-primary-400 font-medium uppercase tracking-wide">{product.category}</span>
        </div>
        <h3 className={`font-semibold text-white group-hover:text-primary-300 transition-colors line-clamp-2 mb-2 ${compact ? 'text-sm' : 'text-base'}`}>
          {product.name}
        </h3>

        {!compact && (
          <p className="text-dark-400 text-xs line-clamp-2 mb-3">{product.description}</p>
        )}

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="text-sm font-medium text-white">{product.rating}</span>
          <span className="text-dark-500 text-xs">({product.reviewCount})</span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div>
            <span className={`font-bold text-white ${compact ? 'text-base' : 'text-xl'}`}>
              {formatINR(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-dark-500 text-sm line-through ml-2">
                {formatINR(product.originalPrice)}
              </span>
            )}
          </div>

          {onAddToCart && product.stock > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
              className="bg-primary-600 hover:bg-primary-500 text-white rounded-xl p-2 transition-all duration-200 hover:scale-105 active:scale-95"
              title="Add to cart"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
