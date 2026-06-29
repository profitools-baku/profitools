import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { ZendorLogo } from "./ZendorLogo";

export function SplashLoader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Hide loader after a minimum of 1.2s to show the animation
    const timer = setTimeout(() => {
      setVisible(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4, ease: "easeInOut" } }}
          className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center z-[99999]"
        >
          {/* Logo animation */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <ZendorLogo size="lg" animate={true} />
            <div className="leading-tight text-white select-none text-center sm:text-left">
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl font-extrabold tracking-wider text-white"
              >
                ZENDOR<span className="text-orange-500 ml-1">TOOLS</span>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 0.6, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-sm text-slate-400 uppercase tracking-[0.2em] font-semibold mt-1"
              >
                Azerbaijan
              </motion.div>
            </div>
          </div>
          {/* Loading line */}
          <div className="w-48 h-1 bg-slate-800 rounded-full mt-8 overflow-hidden relative">
            <motion.div
              initial={{ left: "-100%" }}
              animate={{ left: "100%" }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
