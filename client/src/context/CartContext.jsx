import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await api.get('/cart');
      setCart(res.data.cart);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCart(); }, [user]);

  const addToCart = async (productId, quantity = 1) => {
    const res = await api.post('/cart/add', { productId, quantity });
    setCart(res.data.cart);
    return res.data;
  };

  const removeFromCart = async (productId) => {
    const res = await api.delete(`/cart/remove/${productId}`);
    setCart(res.data.cart);
    return res.data;
  };

  const updateQuantity = async (productId, quantity) => {
    const res = await api.put('/cart/quantity', { productId, quantity });
    setCart(res.data.cart);
    return res.data;
  };

  const clearCart = async () => {
    await api.delete('/cart/clear');
    setCart(null);
  };

  const itemCount = cart?.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

  return (
    <CartContext.Provider value={{ cart, setCart, loading, fetchCart, addToCart, removeFromCart, updateQuantity, clearCart, itemCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
