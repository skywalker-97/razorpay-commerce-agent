import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Bot, ShoppingCart, CreditCard, CheckCircle, XCircle, Info, Zap, ChevronDown, ChevronUp, Filter, Activity, Fingerprint } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import useSocket from '../../hooks/useSocket';

const formatINR = (amount) =>
  amount ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount) : '—';

const ACTION_ICONS = {
  USER_REQUEST: Info, AI_SEARCH_PRODUCTS: Bot, AI_RECOMMENDATION: Zap, AI_TOOL_CALL: Bot,
  AI_GET_PRODUCT: Bot, CART_UPDATED: ShoppingCart, CART_ITEM_REMOVED: ShoppingCart,
  CART_CALCULATED: ShoppingCart, CHECKOUT_PREVIEW_CREATED: FileText,
  USER_PAYMENT_APPROVAL: CheckCircle, RAZORPAY_ORDER_CREATED: CreditCard,
  PAYMENT_ATTEMPTED: CreditCard, PAYMENT_SUCCESS: CheckCircle, PAYMENT_FAILED: XCircle,
  ORDER_CREATED: CheckCircle, PAYMENT_VERIFIED: CheckCircle, AUTH_LOGIN: Info,
  AUTH_REGISTER: Info, SYSTEM_ERROR: XCircle,
};

const STATUS_COLORS = {
  success: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  failure: 'text-red-400 bg-red-500/10 border-red-500/30',
  info: 'text-primary-400 bg-primary-500/10 border-primary-500/30',
  pending: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
};

const NODE_COLORS = {
  PAYMENT_SUCCESS: 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]', 
  ORDER_CREATED: 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]',
  PAYMENT_FAILED: 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]', 
  SYSTEM_ERROR: 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]',
  USER_PAYMENT_APPROVAL: 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]', 
  RAZORPAY_ORDER_CREATED: 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]',
  AI_RECOMMENDATION: 'bg-accent-500 shadow-[0_0_10px_rgba(217,70,239,0.5)]', 
  USER_REQUEST: 'bg-dark-400',
  CART_UPDATED: 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]',
};

export default function AuditLogs() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterAction, setFilterAction] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (socket && isConnected && user) {
      socket.emit('join_merchant_room', user._id);

      const handleNewLog = (newLog) => {
        setLogs(prev => [newLog, ...prev]);
        setTotal(prev => prev + 1);
      };

      socket.on('new_audit_log', handleNewLog);

      return () => {
        socket.off('new_audit_log', handleNewLog);
      };
    }
  }, [socket, isConnected, user]);

  useEffect(() => { if (!user) { navigate('/login'); return; } fetchLogs(); }, [filterAction, filterStatus, page]);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: 30 };
      if (filterAction) params.action = filterAction;
      if (filterStatus) params.status = filterStatus;
      const res = await api.get('/audit', { params });
      setLogs(res.data.logs || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
      setError(err.response?.data?.message || 'Failed to load audit logs');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const allActions = ['USER_REQUEST','AI_SEARCH_PRODUCTS','AI_RECOMMENDATION','CART_UPDATED',
    'CHECKOUT_PREVIEW_CREATED','USER_PAYMENT_APPROVAL','RAZORPAY_ORDER_CREATED',
    'PAYMENT_SUCCESS','PAYMENT_FAILED','ORDER_CREATED','AUTH_LOGIN','SYSTEM_ERROR'];

  return (
    <div className="min-h-screen bg-transparent pt-20 pb-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary-900/10 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-accent-900/10 rounded-full blur-[100px] pointer-events-none z-0" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-primary-400 font-mono text-xs mb-3 uppercase tracking-widest bg-primary-500/10 border border-primary-500/20 px-3 py-1 rounded-full">
              <Activity className="w-3 h-3 animate-pulse" /> Cryptographic Ledger
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
              Immutable Audit Trail
            </h1>
            <p className="text-dark-400 mt-2 font-mono text-sm">Indexed {total} secure events logged in system timeline</p>
          </div>

          <div className="glass-panel p-3 flex flex-col sm:flex-row gap-3 rounded-xl border-dark-700 w-full md:w-auto">
            <div className="flex items-center gap-2 text-primary-400 pl-2"><Filter className="w-4 h-4" /></div>
            <select className="bg-dark-900 border border-dark-700 text-white text-sm rounded-lg py-2 px-3 focus:outline-none focus:border-primary-500/50" value={filterAction} onChange={(e) => { setFilterAction(e.target.value); setPage(1); }}>
              <option value="">All Actions</option>
              {allActions.map(a => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
            </select>
            <select className="bg-dark-900 border border-dark-700 text-white text-sm rounded-lg py-2 px-3 focus:outline-none focus:border-primary-500/50 w-full sm:w-32" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}>
              <option value="">All Status</option>
              <option value="success">Success</option>
              <option value="failure">Failure</option>
              <option value="info">Info</option>
            </select>
            <button onClick={() => { setFilterAction(''); setFilterStatus(''); setPage(1); }} className="btn-secondary text-sm py-2 px-4 rounded-lg bg-dark-800 hover:bg-dark-700">Clear</button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-dark-700 before:to-transparent">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-dark-950 bg-dark-800 absolute left-0 md:left-1/2 -translate-y-4 sm:translate-y-0 transform -translate-x-1/2 shimmer"></div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] card shimmer h-24" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20 glass-panel border-red-800/40">
            <XCircle className="w-16 h-16 text-red-500/60 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Failed to load logs</h3>
            <p className="text-red-400 font-mono text-sm">{error}</p>
            <button onClick={fetchLogs} className="mt-6 btn-secondary px-6 py-2 text-sm">Retry</button>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-20 glass-panel border-dark-800">
            <Activity className="w-16 h-16 text-dark-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Ledger is empty</h3>
            <p className="text-dark-400 font-mono text-sm">Initialize agent protocol to begin logging</p>
          </div>
        ) : (
          <div className="relative before:absolute before:inset-0 before:ml-[1.3rem] md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary-900/50 before:via-dark-700 before:to-transparent">
            {logs.map((log, index) => {
              const Icon = ACTION_ICONS[log.action] || Info;
              const isExpanded = expandedId === log._id;
              const nodeColor = NODE_COLORS[log.action] || 'bg-primary-500 shadow-[0_0_10px_rgba(14,165,233,0.3)]';
              
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={log._id} 
                  className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group mb-8`}
                >
                  {/* Timeline Node */}
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-dark-950 ${nodeColor} absolute left-0 md:left-1/2 -translate-y-4 sm:translate-y-0 transform -translate-x-1/2 z-10 transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>

                  {/* Card Content */}
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] ml-12 md:ml-0">
                    <div 
                      className={`relative glass-panel p-0 cursor-pointer border-dark-700/50 hover:border-primary-500/50 transition-all duration-300 overflow-hidden ${isExpanded ? 'ring-1 ring-primary-500/30' : ''}`}
                      onClick={() => setExpandedId(isExpanded ? null : log._id)}
                    >
                      <div className="p-4 sm:p-5">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <span className="font-bold text-white text-sm sm:text-base tracking-wide flex items-center gap-2">
                              {log.action.replace(/_/g, ' ')}
                            </span>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border ${STATUS_COLORS[log.status] || STATUS_COLORS.info}`}>
                                {log.status}
                              </span>
                              {log.toolName && <span className="bg-primary-900/30 text-primary-300 border border-primary-500/20 px-2 py-0.5 rounded text-[10px] font-mono">{log.toolName}</span>}
                              {log.amount && <span className="bg-emerald-900/30 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-mono">{formatINR(log.amount)}</span>}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-2">
                            <p className="text-dark-300 text-xs font-mono">{new Date(log.createdAt).toLocaleTimeString('en-IN')}</p>
                            <p className="text-dark-500 text-[10px] mt-0.5 uppercase tracking-wider">{new Date(log.createdAt).toLocaleDateString('en-IN')}</p>
                          </div>
                        </div>

                        {log.error && (
                          <div className="mt-3 bg-red-900/10 border border-red-500/20 p-2.5 rounded-lg flex items-start gap-2">
                            <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                            <p className="text-red-400 text-xs font-medium">{log.error}</p>
                          </div>
                        )}

                        {/* Dedicated PAYMENT_FAILED Summary Banner */}
                        {log.action === 'PAYMENT_FAILED' && (
                          <div className="mt-3 bg-red-950/40 border border-red-500/30 rounded-xl p-3 space-y-1.5">
                            <div className="flex items-center gap-2 mb-2">
                              <XCircle className="w-4 h-4 text-red-400" />
                              <span className="text-red-400 font-bold text-xs uppercase tracking-widest">🔴 Payment Failed</span>
                            </div>
                            {log.razorpayOrderId && (
                              <p className="text-dark-300 text-xs font-mono">
                                <span className="text-dark-500">Order:</span> {log.razorpayOrderId}
                              </p>
                            )}
                            {log.error && (
                              <p className="text-red-300 text-xs">
                                <span className="text-dark-500">Reason:</span> {log.error}
                              </p>
                            )}
                            {log.metadata?.attemptNumber && (
                              <p className="text-amber-400 text-xs font-mono">
                                <span className="text-dark-500">Attempt:</span> {log.metadata.attemptNumber} / {log.output?.maxAttempts || 3}
                              </p>
                            )}
                            {log.amount && (
                              <p className="text-dark-300 text-xs font-mono">
                                <span className="text-dark-500">Amount:</span> {formatINR(log.amount)}
                              </p>
                            )}
                            <p className="text-dark-600 text-[10px] font-mono uppercase pt-1">Auto-retry: DISABLED · No funds charged</p>
                          </div>
                        )}
                        
                        {log.sessionId && (
                          <div className="mt-3 flex items-center gap-2 text-[10px] font-mono text-dark-500 bg-dark-900/50 px-2 py-1 rounded w-fit border border-dark-800">
                            <Fingerprint className="w-3 h-3" />
                            {log.sessionId.substring(0, 24)}...
                          </div>
                        )}

                        <div className="absolute bottom-4 right-4 text-dark-500 transition-transform duration-300 group-hover:text-primary-400">
                           {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="px-4 pb-4 border-t border-dark-800 pt-4 bg-dark-900/30"
                          >
                            <div className="space-y-4">
                              {log.input && (
                                <div>
                                  <p className="text-primary-500/70 mb-2 uppercase tracking-widest text-[10px] font-bold flex items-center gap-1.5"><Zap className="w-3 h-3"/> Input Payload</p>
                                  <pre className="bg-transparent border border-dark-800 rounded-lg p-3 text-primary-50/70 overflow-x-auto text-[11px] font-mono custom-scrollbar">{JSON.stringify(log.input, null, 2)}</pre>
                                </div>
                              )}
                              {log.output && (
                                <div>
                                  <p className="text-accent-500/70 mb-2 uppercase tracking-widest text-[10px] font-bold flex items-center gap-1.5"><CheckCircle className="w-3 h-3"/> Output State</p>
                                  <pre className="bg-transparent border border-dark-800 rounded-lg p-3 text-primary-50/70 overflow-x-auto text-[11px] font-mono custom-scrollbar">{JSON.stringify(log.output, null, 2)}</pre>
                                </div>
                              )}
                            </div>
                            {log.userId && <p className="text-dark-400 text-[10px] font-mono uppercase tracking-wider mt-4 text-right">Actor: {log.userId?.name || String(log.userId)}</p>}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {total > 30 && (
          <div className="flex justify-center gap-3 mt-12 relative z-10">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary px-6 py-2.5 disabled:opacity-50">Previous Phase</button>
            <span className="flex items-center px-4 font-mono text-dark-400 text-sm bg-dark-900 rounded-xl border border-dark-800">{page} / {Math.ceil(total / 30)}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 30)} className="btn-secondary px-6 py-2.5 disabled:opacity-50">Next Phase</button>
          </div>
        )}
      </div>
    </div>
  );
}
