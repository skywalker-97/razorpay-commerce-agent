import { Link } from 'react-router-dom';
import { Bot, ShoppingCart, Shield, BarChart3, Zap, ArrowRight, CheckCircle, Network, Lock, Fingerprint } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative z-10 pt-40 pb-24">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="max-w-7xl mx-auto px-6 text-center"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 glass-strong rounded-full px-5 py-2 mb-8 border-primary-500/30">
            <Network className="w-4 h-4 text-primary-400" />
            <span className="text-primary-100 text-sm font-medium tracking-wide">Razorpay Hackathon Prototype</span>
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-6xl md:text-8xl font-black text-white mb-6 leading-[1.1] tracking-tight">
            AI-Powered
            <br />
            <span className="bg-gradient-to-r from-primary-400 via-primary-300 to-accent-400 bg-clip-text text-transparent">Commerce Agent</span>
          </motion.h1>
          
          <motion.p variants={fadeUp} className="text-xl text-dark-300 max-w-3xl mx-auto mb-12 leading-relaxed">
            A conversational AI shopping agent that discovers products, delivers personalized recommendations,
            drives upsell revenue, and processes payments — with absolute transparency.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-5 justify-center">
            <Link
              to={user ? '/customer' : '/login'}
              className="btn-primary text-lg px-8 py-4 flex items-center justify-center gap-3 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              <Bot className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Initialize Agent</span>
              <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/products" className="btn-secondary text-lg px-8 py-4 flex items-center justify-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              View Catalog
            </Link>
          </motion.div>

          {/* KPI Mini-cards */}
          <motion.div variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-24">
            {[
              { label: 'AI-Assisted Revenue', value: '₹42,300', icon: Bot },
              { label: 'Upsell Revenue', value: '₹8,450', icon: BarChart3 },
              { label: 'AI Conversion Rate', value: '18.6%', icon: Zap },
              { label: 'Safety Guardrails', value: '8 Rules', icon: Shield },
            ].map((stat, i) => (
              <motion.div key={stat.label} variants={fadeUp} className="glass-panel rounded-2xl p-6 text-left group hover:-translate-y-1 transition-transform duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-dark-800 flex items-center justify-center border border-dark-700 group-hover:border-primary-500/50 transition-colors">
                    <stat.icon className="w-5 h-5 text-primary-400" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-dark-400 text-sm font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Demo Flow */}
      <section className="relative z-10 py-24 bg-dark-900/40 border-y border-dark-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Autonomous Transaction Flow</h2>
            <p className="text-primary-400 text-lg">End-to-end AI commerce in action</p>
          </div>
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { step: '01', title: 'Discover', desc: 'Natural language queries', icon: '🔍' },
              { step: '02', title: 'Recommend', desc: 'Contextual AI upsells', icon: '✨' },
              { step: '03', title: 'Add to Cart', desc: 'Explicit user consent', icon: '🛒' },
              { step: '04', title: 'Preview', desc: 'Immutable pricing hash', icon: '📋' },
              { step: '05', title: 'Authorize', desc: 'User signature required', icon: '✅' },
              { step: '06', title: 'Execute', desc: 'Razorpay Test Mode', icon: '💳' },
            ].map((item, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                key={item.step} 
                className="card relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 text-dark-800 font-mono text-4xl font-black opacity-20 select-none">
                  {item.step}
                </div>
                <div className="text-2xl mb-4">{item.icon}</div>
                <h3 className="font-bold text-white mb-2">{item.title}</h3>
                <p className="text-dark-400 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Architecture */}
      <section className="relative z-10 py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 text-primary-400 font-mono text-sm mb-6 uppercase tracking-widest">
                <Shield className="w-4 h-4" /> Security Architecture
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Deterministic Money Guardrails
              </h2>
              <p className="text-dark-300 text-lg mb-10 leading-relaxed">
                The Agentic system operates in a sandboxed environment. Every financial action is explainable, bounded, and cryptographically gated. The AI cannot initiate transactions without human-in-the-loop validation.
              </p>
              <div className="space-y-5">
                {[
                  { title: 'Sandboxed Intent', desc: 'AI cannot directly charge the customer' },
                  { title: 'Explicit Authorization', desc: 'Human confirmation required before payment' },
                  { title: 'Server-Side Verification', desc: 'Prices calculated securely; never trust client' },
                  { title: 'Immutable Audit Trail', desc: 'Every action logged in cryptographic timeline' },
                ].map((rule, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="mt-1">
                      <Lock className="w-5 h-5 text-primary-500" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">{rule.title}</h4>
                      <p className="text-dark-400 text-sm">{rule.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="glass-panel p-8 rounded-3xl relative"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-primary-500/5 to-transparent rounded-3xl pointer-events-none" />
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-dark-800">
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  <Fingerprint className="w-6 h-6 text-primary-400" />
                  Live Telemetry
                </h3>
                <span className="badge-primary animate-pulse-soft">System Online</span>
              </div>
              <div className="space-y-6">
                {[
                  { label: 'Total Volume', value: '₹1,24,500', trend: '+23%' },
                  { label: 'AI Influenced', value: '₹42,300', trend: '+34%' },
                  { label: 'Autonomous Upsell', value: '₹8,450', trend: '+67%' },
                ].map((metric) => (
                  <div key={metric.label} className="flex items-center justify-between group">
                    <span className="text-dark-300 font-medium group-hover:text-primary-300 transition-colors">{metric.label}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-white font-mono text-lg">{metric.value}</span>
                      <span className="text-emerald-400 text-sm font-semibold bg-emerald-400/10 px-2 py-1 rounded-md">{metric.trend}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-32 border-t border-dark-800">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900/10 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Initialize the Protocol</h2>
          <p className="text-dark-400 text-xl mb-10 max-w-2xl mx-auto">Experience the complete autonomous commerce flow from intent discovery to secure checkout.</p>
          <Link
            to={user ? '/customer' : '/login'}
            className="btn-primary text-lg px-12 py-5 inline-flex items-center gap-3 group"
          >
            <Zap className="w-5 h-5" />
            Connect Agent
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
}
