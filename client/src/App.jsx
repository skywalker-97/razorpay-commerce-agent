import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import NetworkBackground from './components/NetworkBackground';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import CustomerAgent from './pages/CustomerAgent';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import CartPage from './pages/CartPage';
import Checkout from './pages/Checkout';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';
import MerchantDashboard from './pages/merchant/Dashboard';
import MerchantProducts from './pages/merchant/Products';
import AuditLogs from './pages/merchant/AuditLogs';

// Protected Route
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

function AppContent() {
  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <NetworkBackground />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        
        <Route path="/customer" element={
          <ProtectedRoute roles={['customer', 'admin']}>
            <CustomerAgent />
          </ProtectedRoute>
        } />
        
        <Route path="/cart" element={
          <ProtectedRoute>
            <CartPage />
          </ProtectedRoute>
        } />
        
        <Route path="/checkout" element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        } />
        
        <Route path="/payment/success" element={
          <ProtectedRoute>
            <PaymentSuccess />
          </ProtectedRoute>
        } />
        
        <Route path="/payment/failure" element={<PaymentFailure />} />
        
        <Route path="/merchant/dashboard" element={
          <ProtectedRoute roles={['merchant', 'admin']}>
            <MerchantDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/merchant/products" element={
          <ProtectedRoute roles={['merchant', 'admin']}>
            <MerchantProducts />
          </ProtectedRoute>
        } />
        
        <Route path="/merchant/audit-logs" element={
          <ProtectedRoute roles={['merchant', 'admin']}>
            <AuditLogs />
          </ProtectedRoute>
        } />
        
        <Route path="/merchant/orders" element={
          <ProtectedRoute roles={['merchant', 'admin']}>
            <MerchantDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppContent />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1e293b',
                color: '#f1f5f9',
                border: '1px solid #334155',
                borderRadius: '12px',
              },
              success: { iconTheme: { primary: '#10b981', secondary: '#1e293b' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#1e293b' } },
            }}
          />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
