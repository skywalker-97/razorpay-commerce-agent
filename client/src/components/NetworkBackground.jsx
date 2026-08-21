import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function NetworkBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    
    // Performance optimization: track canvas dimensions
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', handleResize);

    // Create particles based on screen size (responsive)
    const particleCount = Math.min(Math.floor((width * height) / 12000), 120); 
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4, // Slow horizontal speed
        vy: (Math.random() - 0.5) * 0.4, // Slow vertical speed
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.6 + 0.2
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        
        // Wrap around edges
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;
        
        // Draw particle
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = '#38bdf8'; // primary-400
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw connecting lines (The Network effect)
        for (let j = i + 1; j < particles.length; j++) {
          let p2 = particles[j];
          let dx = p.x - p2.x;
          let dy = p.y - p2.y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 150) {
            ctx.globalAlpha = (1 - distance / 150) * 0.25; // fade out with distance
            ctx.strokeStyle = '#38bdf8'; // primary-400
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
      
      // Reset alpha
      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-transparent">
      {/* Deep Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vw] bg-primary-900/10 rounded-full blur-[150px]" />
      
      {/* Massive Concentric Rings (The Radar/Network Effect) - Optimized with pure CSS */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250vw] h-[250vw] md:w-[150vw] md:h-[150vw] flex items-center justify-center opacity-40">
        {[...Array(12)].map((_, i) => {
          const size = (i + 1) * 7.5; // percentage size
          const isDashed = i % 2 === 0;
          return (
            <div
              key={i}
              className="absolute rounded-full border"
              style={{
                width: `${size}%`,
                height: `${size}%`,
                borderColor: i % 3 === 0 ? 'rgba(56, 189, 248, 0.25)' : 'rgba(148, 163, 184, 0.15)',
                borderStyle: isDashed ? 'dashed' : 'dotted',
                borderWidth: i % 4 === 0 ? '2px' : '1px',
                opacity: 1 - (i * 0.06),
                animation: `${isDashed ? 'spin-right' : 'spin-left'} ${150 + i * 20}s linear infinite`
              }}
            />
          );
        })}
      </div>

      {/* Abstract 3D-like Node Clusters */}
      <div className="absolute inset-0">
        {/* Cluster 1 - Blue Hexagon-like */}
        <motion.div 
          animate={{ y: [0, -25, 0], x: [0, 15, 0], rotate: [0, 45, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[25%] left-[15%] w-56 h-56"
        >
          <div className="absolute inset-0 border border-primary-500/30 border-dashed animate-[spin_20s_linear_infinite]" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }} />
          <div className="absolute inset-4 border border-primary-400/40 border-dotted animate-[spin_25s_linear_infinite_reverse]" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }} />
          <div className="absolute inset-8 rounded-full border border-primary-300/30 border-dashed animate-[spin_15s_linear_infinite]" />
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-3 h-3 bg-primary-400 rounded-full shadow-[0_0_20px_5px_#38bdf8]" />
          </div>
          <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 100 100">
             <line x1="50" y1="50" x2="50" y2="0" stroke="#38bdf8" strokeWidth="0.5" strokeDasharray="2,2" />
             <line x1="50" y1="50" x2="93" y2="25" stroke="#38bdf8" strokeWidth="0.5" strokeDasharray="2,2" />
             <line x1="50" y1="50" x2="7" y2="75" stroke="#38bdf8" strokeWidth="0.5" strokeDasharray="2,2" />
             <line x1="50" y1="50" x2="93" y2="75" stroke="#38bdf8" strokeWidth="0.5" strokeDasharray="2,2" />
          </svg>
        </motion.div>

        {/* Cluster 2 - Cyan/Teal Geometric (Bottom Right) */}
        <motion.div 
          animate={{ y: [0, 35, 0], x: [0, -25, 0], rotate: [0, -30, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[20%] right-[15%] w-72 h-72"
        >
          <div className="absolute inset-0 rounded-full border border-accent-500/20 border-dashed animate-[spin_30s_linear_infinite]" />
          <div className="absolute inset-6 rounded-full border border-accent-400/30 border-dotted animate-[spin_35s_linear_infinite_reverse]" />
          <div className="absolute inset-12 border border-accent-300/40 border-dashed animate-[spin_20s_linear_infinite]" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-4 h-4 bg-accent-400 rounded-full shadow-[0_0_25px_6px_#2dd4bf]" />
          </div>
          <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 100 100">
             <line x1="50" y1="50" x2="50" y2="12" stroke="#2dd4bf" strokeWidth="0.5" />
             <line x1="50" y1="50" x2="88" y2="50" stroke="#2dd4bf" strokeWidth="0.5" />
             <line x1="50" y1="50" x2="12" y2="50" stroke="#2dd4bf" strokeWidth="0.5" />
             <line x1="50" y1="50" x2="50" y2="88" stroke="#2dd4bf" strokeWidth="0.5" />
          </svg>
        </motion.div>

        {/* Cluster 3 - White Dense Sphere (Center Bottom) */}
        <motion.div 
          animate={{ y: [0, -15, 0], x: [0, -10, 0], rotate: [0, 60, 0] }}
          transition={{ duration: 28, repeat: Infinity, ease: "easeInOut", delay: 5 }}
          className="absolute bottom-[12%] left-[45%] w-48 h-48"
        >
          <div className="absolute inset-0 rounded-full border border-white/20 border-dotted animate-[spin_15s_linear_infinite]" />
          <div className="absolute inset-2 rounded-full border border-white/30 border-dashed animate-[spin_20s_linear_infinite_reverse]" />
          <div className="absolute inset-4 rounded-full border border-gray-400/30 border-dotted animate-[spin_25s_linear_infinite]" />
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-3 h-3 bg-white rounded-full shadow-[0_0_20px_4px_#ffffff]" />
          </div>
        </motion.div>
        
        {/* Cluster 4 - Deep Blue (Top Right) */}
        <motion.div 
          animate={{ y: [0, 25, 0], x: [0, 20, 0], rotate: [0, -15, 0] }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute top-[15%] right-[25%] w-40 h-40"
        >
          <div className="absolute inset-0 rounded-full border border-blue-500/30 border-dashed animate-[spin_18s_linear_infinite]" />
          <div className="absolute inset-3 rounded-full border border-blue-400/40 border-dotted animate-[spin_15s_linear_infinite_reverse]" />
          <div className="absolute inset-6 border border-blue-300/30 border-dashed animate-[spin_22s_linear_infinite]" style={{ clipPath: 'polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)' }} />
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_15px_3px_#60a5fa]" />
          </div>
        </motion.div>
      </div>

      {/* High-Performance Canvas Particles replacing the DOM-based ones */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-70" />
    </div>
  );
}
