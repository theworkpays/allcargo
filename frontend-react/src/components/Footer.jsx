import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Footer() {
  const linkVariants = {
    hover: { scale: 1.05, x: 5, color: '#10b981', transition: { duration: 0.2 } }
  };

  return (
    <footer className="relative bg-slate-950 pt-16 pb-8 border-t border-slate-900 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl translate-y-1/2"></div>
      
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8 md:gap-12 mb-12">
          
          {/* Brand & Tagline */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center md:items-start text-center md:text-left"
          >
            <div className="flex items-center gap-2 mb-4">
              <motion.span 
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="material-symbols-outlined text-primary text-3xl"
              >
                rocket_launch
              </motion.span>
              <span className="font-display font-black text-2xl tracking-tight text-white">Allcargo</span>
            </div>
            <p className="text-slate-400 text-sm max-w-xs">
              Next-generation global logistics and real-time tracking.
            </p>
          </motion.div>

          {/* Minimal Links */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center md:justify-end gap-x-8 gap-y-4"
          >
            <motion.div variants={linkVariants} whileHover="hover">
              <Link to="/tracking" className="text-slate-300 font-medium text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">radar</span> Live Tracking
              </Link>
            </motion.div>
            <motion.div variants={linkVariants} whileHover="hover">
              <Link to="/" className="text-slate-300 font-medium text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">local_shipping</span> Services
              </Link>
            </motion.div>
            <motion.div variants={linkVariants} whileHover="hover">
              <Link to="/" className="text-slate-300 font-medium text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">info</span> About
              </Link>
            </motion.div>
            <motion.div variants={linkVariants} whileHover="hover">
              <Link to="/" className="text-slate-300 font-medium text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">support_agent</span> Contact
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="pt-6 border-t border-slate-800/50 flex flex-col sm:flex-row justify-between items-center gap-4"
        >
          <p className="text-slate-500 text-xs">© 2026 Allcargo. All rights reserved.</p>
          <div className="flex items-center gap-2 text-xs text-slate-400">
             <span className="relative flex h-2 w-2 mr-1">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
             </span>
             System Status: <span className="text-primary font-bold ml-1">100% Operational</span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
