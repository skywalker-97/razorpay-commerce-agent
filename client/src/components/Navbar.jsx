import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Bot, Package, LayoutDashboard, LogOut, LogIn, Menu, X, Zap } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const navLinks = user?.role === 'merchant' || user?.role === 'admin'
    ? [
        { to: '/merchant/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/merchant/products', label: 'Products', icon: Package },
        { to: '/merchant/audit-logs', label: 'Audit Trail', icon: Zap },
      ]
    : [
        { to: '/customer', label: 'AI Agent', icon: Bot },
        { to: '/products', label: 'Products', icon: Package },
        { to: '/cart', label: 'Cart', icon: ShoppingCart },
      ];

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-dark-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-900/40 group-hover:shadow-primary-800/60 transition-all">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-white text-lg leading-none">RazorPay</span>
              <span className="block text-xs text-primary-400 leading-none font-medium">Commerce Agent</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive(to)
                    ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                    : 'text-dark-300 hover:text-white hover:bg-dark-800'
                }`}>
                <Icon className="w-4 h-4" />
                {label}
                {label === 'Cart' && itemCount > 0 && (
                  <span className="bg-accent-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm font-bold">
                    {user.name[0].toUpperCase()}
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-sm font-medium text-white leading-none">{user.name}</p>
                    <p className="text-xs text-dark-400 capitalize">{user.role}</p>
                  </div>
                </div>
                <button onClick={handleLogout} className="btn-secondary text-sm flex items-center gap-2 py-2">
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-primary text-sm flex items-center gap-2">
                <LogIn className="w-4 h-4" />
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button className="md:hidden p-2 rounded-lg text-dark-300 hover:text-white hover:bg-dark-800"
            onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden glass border-t border-dark-700/50 px-4 py-4 space-y-2">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive(to) ? 'bg-primary-500/20 text-primary-300' : 'text-dark-300 hover:text-white hover:bg-dark-800'
              }`}>
              <Icon className="w-4 h-4" />
              {label}
              {label === 'Cart' && itemCount > 0 && (
                <span className="ml-auto bg-accent-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{itemCount}</span>
              )}
            </Link>
          ))}
          <div className="pt-2 border-t border-dark-700">
            {user ? (
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-dark-800">
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-primary-400 hover:bg-dark-800">
                <LogIn className="w-4 h-4" />
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
