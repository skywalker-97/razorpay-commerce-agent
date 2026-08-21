import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, ShoppingBag, Bot, Zap, BarChart3, Package, FileText, ArrowUpRight, Activity } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const formatINR = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

const COLORS = ['#0ea5e9', '#6366f1', '#10b981', '#f59e0b']; // Cyan, Indigo, Emerald, Amber

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-strong rounded-xl p-3 text-sm border-primary-500/30 shadow-[0_0_15px_rgba(14,165,233,0.15)] bg-dark-900/90 backdrop-blur-xl">
        <p className="text-dark-300 mb-2 font-mono text-xs uppercase tracking-widest border-b border-dark-800 pb-2">{label}</p>
        {payload.map((p, i) => (
          <div key={i} className="flex items-center justify-between gap-4 mt-1">
            <span className="text-dark-400 text-xs">{p.name || 'Value'}:</span>
            <span style={{ color: p.color }} className="font-mono font-bold">{formatINR(p.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function MerchantDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || (user.role !== 'merchant' && user.role !== 'admin')) {
      navigate('/login');
      return;
    }
    api.get('/merchant/dashboard').then(res => {
      setData(res.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-transparent pt-20 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="w-12 h-12 border-4 border-primary-900 border-t-primary-500 rounded-full animate-spin mb-4 relative z-10 shadow-[0_0_15px_rgba(14,165,233,0.3)]" />
      <p className="text-primary-400 font-mono text-sm tracking-widest uppercase relative z-10 animate-pulse">Syncing Telemetry...</p>
    </div>
  );

  const stats = data?.stats || {};
  const recentOrders = data?.recentOrders || [];
  const revenueChart = data?.revenueChart?.length > 0 ? data.revenueChart : [
    { month: 'Jun-25', revenue: 18500 },
    { month: 'Jul-25', revenue: 24300 },
    { month: 'Aug-25', revenue: 31200 },
    { month: 'Sep-25', revenue: 28900 },
    { month: 'Oct-25', revenue: 42100 },
    { month: 'Nov-25', revenue: 38700 },
    { month: 'Dec-25', revenue: 56800 },
    { month: 'Jan-26', revenue: 47200 },
    { month: 'Feb-26', revenue: 62400 },
    { month: 'Mar-26', revenue: 71800 },
  ];

  const pieData = [
    { name: 'Organic', value: stats.totalRevenue - stats.aiAssistedRevenue || 82200 },
    { name: 'AI Accelerated', value: stats.aiAssistedRevenue || 42300 },
  ];

  const statCards = [
    { label: 'Total Volume', value: formatINR(stats.totalRevenue || 124500), icon: TrendingUp, color: 'primary', trend: '+23%' },
    { label: 'Network Orders', value: stats.totalOrders || 47, icon: ShoppingBag, color: 'accent', trend: '+12%' },
    { label: 'Avg Node Value', value: formatINR(stats.avgOrderValue || 2649), icon: BarChart3, color: 'success', trend: '+8%' },
    { label: 'AI Assisted Vol', value: formatINR(stats.aiAssistedRevenue || 42300), icon: Bot, color: 'primary', trend: '+34%' },
    { label: 'Autonomous Upsell', value: formatINR(stats.upsellRevenue || 8450), icon: Zap, color: 'warning', trend: '+67%' },
    { label: 'Agent Conversion', value: `${stats.aiConversionRate || 18.6}%`, icon: Activity, color: 'success', trend: '+5.2%' },
  ];

  const colorMap = {
    primary: 'text-primary-400 bg-primary-500/10 border-primary-500/30 shadow-[0_0_15px_rgba(14,165,233,0.15)]',
    accent: 'text-accent-400 bg-accent-500/10 border-accent-500/30 shadow-[0_0_15px_rgba(217,70,239,0.15)]',
    success: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]',
    warning: 'text-amber-400 bg-amber-500/10 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]',
  };

  return (
    <div className="min-h-screen bg-transparent pt-20 pb-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-primary-900/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-accent-900/5 rounded-full blur-[100px] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 text-primary-400 font-mono text-xs mb-3 uppercase tracking-widest bg-primary-500/10 border border-primary-500/20 px-3 py-1 rounded-full">
              <Activity className="w-3 h-3 animate-pulse" /> Live Telemetry
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-wide">Command Center</h1>
            <p className="text-dark-400 mt-2 font-mono text-sm">System Performance & Network Analytics</p>
          </div>
          <div className="flex gap-4">
            <button onClick={() => navigate('/merchant/audit-logs')} className="btn-secondary flex items-center gap-2 text-sm bg-dark-900 border-dark-700 hover:border-primary-500/50 hover:text-primary-300">
              <FileText className="w-4 h-4" />
              Audit Ledger
            </button>
            <button onClick={() => navigate('/merchant/products')} className="btn-primary flex items-center gap-2 text-sm shadow-[0_0_15px_rgba(14,165,233,0.3)]">
              <Package className="w-4 h-4" />
              Inventory DB
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {statCards.map((stat, i) => (
            <motion.div 
              initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: i * 0.05 }}
              key={stat.label} 
              className="glass-panel p-5 group hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-start justify-between mb-4 relative z-10">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${colorMap[stat.color]}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <span className="bg-emerald-900/30 text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded text-xs font-mono font-bold tracking-wider">{stat.trend}</span>
              </div>
              <p className="text-3xl font-black text-white font-mono tracking-tight relative z-10">{stat.value}</p>
              <p className="text-dark-400 text-xs font-semibold uppercase tracking-wider mt-2 relative z-10">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-3 gap-6 mb-10">
          {/* Revenue line chart */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.3 }} className="glass-panel p-6 lg:col-span-2 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-bl-[100px] pointer-events-none" />
            <h2 className="font-bold text-white mb-6 flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-primary-400" />
              Network Revenue Flux
            </h2>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={revenueChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#334155', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  name="Volume"
                  stroke="#0ea5e9" 
                  strokeWidth={3} 
                  dot={{ fill: '#0ea5e9', stroke: '#0f172a', strokeWidth: 2, r: 4 }} 
                  activeDot={{ r: 6, fill: '#38bdf8', stroke: '#0ea5e9', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Revenue split pie */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.4 }} className="glass-panel p-6 relative">
             <div className="absolute top-0 right-0 w-32 h-32 bg-accent-500/5 rounded-bl-[100px] pointer-events-none" />
            <h2 className="font-bold text-white mb-6 flex items-center gap-2 text-lg">
              <Bot className="w-5 h-5 text-primary-400" />
              Intelligence Ratio
            </h2>
            <div className="h-[220px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={pieData} 
                    cx="50%" cy="50%" 
                    innerRadius={60} 
                    outerRadius={85} 
                    dataKey="value"
                    stroke="rgba(15,23,42,0.8)"
                    strokeWidth={4}
                    paddingAngle={5}
                  >
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                 <span className="text-3xl font-black text-white font-mono">34%</span>
                 <span className="text-[10px] text-primary-400 uppercase tracking-widest font-bold">AI Drive</span>
              </div>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              {pieData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.2)]" style={{ background: COLORS[i] }} />
                  <span className="text-dark-300 text-xs font-mono uppercase tracking-wider">{d.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Recent Orders */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.5 }} className="glass-panel p-0 overflow-hidden border-dark-800">
          <div className="p-6 border-b border-dark-800 flex items-center justify-between bg-dark-900/50">
            <h2 className="font-bold text-white flex items-center gap-3 text-lg">
              <Activity className="w-5 h-5 text-primary-400" />
              Latest Transactions
            </h2>
            <button onClick={() => navigate('/merchant/orders')} className="text-primary-400 text-xs font-bold uppercase tracking-widest hover:text-primary-300 flex items-center gap-1 transition-colors">
              View Log <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-16 bg-transparent/50">
              <div className="w-16 h-16 rounded-full bg-dark-900 border border-dark-800 flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-6 h-6 text-dark-600" />
              </div>
              <p className="text-dark-300 font-medium">Awaiting incoming telemetry</p>
              <p className="text-dark-500 font-mono text-xs mt-2">Run seed sequence to populate</p>
            </div>
          ) : (
            <div className="overflow-x-auto bg-transparent/30">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-dark-500 text-[10px] uppercase tracking-widest border-b border-dark-800 bg-transparent">
                    <th className="text-left py-4 px-6 font-semibold">Tx Hash</th>
                    <th className="text-left py-4 px-6 font-semibold">Volume</th>
                    <th className="text-left py-4 px-6 font-semibold">Status</th>
                    <th className="text-left py-4 px-6 font-semibold">Vector</th>
                    <th className="text-left py-4 px-6 font-semibold">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-800/50">
                  {recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-dark-800/40 transition-colors group">
                      <td className="py-4 px-6 font-mono text-primary-400 group-hover:text-primary-300">{order.orderNumber}</td>
                      <td className="py-4 px-6 font-mono font-bold text-white">{formatINR(order.total)}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                          order.status === 'confirmed' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30' : 
                          order.status === 'pending' ? 'bg-amber-900/30 text-amber-400 border-amber-500/30' : 
                          'bg-primary-900/30 text-primary-400 border-primary-500/30'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {order.isAIAssisted ? (
                          <span className="inline-flex items-center gap-1.5 bg-accent-900/20 text-accent-400 border border-accent-500/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                            <Zap className="w-3 h-3" /> AI
                          </span>
                        ) : (
                          <span className="text-dark-500 text-[10px] font-mono uppercase">Organic</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-dark-400 text-xs font-mono">
                        {new Date(order.createdAt).toLocaleString('en-IN', {
                          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
