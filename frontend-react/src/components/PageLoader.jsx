import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function PageLoader() {
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Show loader on route change
    setIsLoading(true);
    
    let isMounted = true;

    // Wait for at least 800ms (for the animation) AND for all fonts to be loaded
    Promise.all([
      new Promise(resolve => setTimeout(resolve, 800)),
      document.fonts ? document.fonts.ready : Promise.resolve()
    ]).then(() => {
      if (isMounted) {
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div 
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          id="react-page-loader" 
          className="fixed inset-0 z-[999] flex items-center justify-center bg-white"
        >
          <div className="flex flex-col items-center">
            
            {/* Animated Logo / Icon */}
            <div className="relative flex items-center justify-center w-20 h-20 mb-6">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary"
              ></motion.div>
              
              <motion.div
                animate={{ scale: [0.9, 1.1, 0.9] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full text-primary"
              >
                <span className="material-symbols-outlined text-3xl">local_shipping</span>
              </motion.div>
            </div>

            {/* Title Stagger */}
            <div className="flex overflow-hidden mb-4">
              {"ALLCARGO".split('').map((char, index) => (
                <motion.span
                  key={index}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                  className="text-2xl font-black tracking-[0.2em] text-primary"
                >
                  {char}
                </motion.span>
              ))}
            </div>
            
            {/* Loading Bar */}
            <div className="w-48 h-1 bg-primary/10 rounded-full overflow-hidden relative">
              <motion.div 
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="absolute top-0 left-0 h-full bg-primary rounded-full"
              ></motion.div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-4 text-[10px] font-bold text-primary/70 uppercase tracking-[0.2em]"
            >
              Initializing Network...
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
