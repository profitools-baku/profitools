import { motion, AnimatePresence } from "framer-motion";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useLocation } from "react-router";

export function LoadingBar() {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const location = useLocation();
  const [routeLoading, setRouteLoading] = useState(false);

  useEffect(() => {
    setRouteLoading(true);
    const timer = setTimeout(() => setRouteLoading(false), 300);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const isLoading = isFetching > 0 || isMutating > 0 || routeLoading;

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="loading-bar"
          initial={{ width: "0%", opacity: 1 }}
          animate={{ 
            width: ["0%", "30%", "70%", "90%"],
            transition: { duration: 1.5, ease: "easeOut" }
          }}
          exit={{ 
            width: "100%", 
            opacity: 0,
            transition: { duration: 0.3, ease: "easeIn" }
          }}
          className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 z-[9999] shadow-[0_1px_10px_rgba(249,115,22,0.5)]"
        />
      )}
    </AnimatePresence>
  );
}
