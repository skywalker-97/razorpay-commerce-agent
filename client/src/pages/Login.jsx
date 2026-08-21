import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Bot, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'customer' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        const data = await login(form.email, form.password);
        toast.success(`Welcome back, ${data.user.name}!`);
        if (data.user.role === 'merchant' || data.user.role === 'admin') {
          navigate('/merchant/dashboard');
        } else {
          navigate('/customer');
        }
      } else {
        const data = await register(form.name, form.email, form.password, form.role);
        toast.success(`Account created! Welcome, ${data.user.name}!`);
        navigate('/customer');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen pt-16 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-primary-900/40">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-dark-400 mt-1">
            {mode === 'login' ? 'Sign in to your account' : 'Join SportZone India'}
          </p>
        </div>

        {/* Demo Credentials Hint */}
        <div className="text-center mb-6">
          <p className="text-dark-500 text-xs">
            Hackathon Demo: <span className="text-dark-300 font-mono">customer@demo.in / customer123</span>
          </p>
          <p className="text-dark-500 text-xs mt-1">
            Merchant: <span className="text-dark-300 font-mono">merchant@sportzone.in / merchant123</span>
          </p>
        </div>

        {/* Form */}
        <div className="glass-strong rounded-3xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                  <input
                    type="text"
                    className="input pl-10"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input
                  type="email"
                  className="input pl-10"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  className="input pl-10 pr-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Account Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {['customer', 'merchant'].map((role) => (
                    <button
                      type="button"
                      key={role}
                      onClick={() => setForm(f => ({ ...f, role }))}
                      className={`px-4 py-3 rounded-xl border text-sm font-medium capitalize transition-all ${
                        form.role === role
                          ? 'bg-primary-500/20 border-primary-500/40 text-primary-300'
                          : 'bg-dark-800 border-dark-600 text-dark-400 hover:text-white'
                      }`}
                    >
                      {role === 'customer' ? '👤 Customer' : '🏪 Merchant'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-dark-400 text-sm hover:text-primary-400 transition-colors"
            >
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <span className="font-semibold text-primary-400">
                {mode === 'login' ? 'Register' : 'Sign In'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
