import { motion } from "framer-motion";

interface ZendorLogoProps {
  className?: string;
  animate?: boolean;
  size?: "sm" | "md" | "lg";
}

export function ZendorLogo({ className = "", animate = true, size = "md" }: ZendorLogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-20 h-20",
  };

  const currentSize = sizeClasses[size];

  // Hexagon rotation variants
  const hexVariants: any = {
    still: { rotate: 0 },
    animate: {
      rotate: 360,
      transition: {
        duration: 20,
        repeat: Infinity,
        ease: "linear",
      },
    },
  };

  // Z path drawing variants
  const pathVariants: any = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { type: "spring", duration: 1.5, bounce: 0 },
        opacity: { duration: 0.5 },
      },
    },
  };

  return (
    <div className={`relative flex items-center justify-center ${currentSize} ${className}`}>
      {/* Glow Effect */}
      {animate && (
        <motion.div
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 bg-orange-500/20 blur-md rounded-full"
        />
      )}

      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_2px_8px_rgba(249,115,22,0.3)]"
      >
        {/* Hexagonal mechanical border */}
        <motion.polygon
          points="50,5 90,28 90,72 50,95 10,72 10,28"
          stroke="url(#zendor-grad-orange)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={hexVariants}
          animate={animate ? "animate" : "still"}
          className="origin-center"
        />

        {/* Small corner bolts inside hexagon */}
        <circle cx="50" cy="15" r="3" fill="#cbd5e1" />
        <circle cx="82" cy="33" r="3" fill="#cbd5e1" />
        <circle cx="82" cy="67" r="3" fill="#cbd5e1" />
        <circle cx="50" cy="85" r="3" fill="#cbd5e1" />
        <circle cx="18" cy="67" r="3" fill="#cbd5e1" />
        <circle cx="18" cy="33" r="3" fill="#cbd5e1" />

        {/* Inner Z - segment 1: Top bar */}
        <motion.path
          d="M32 35 H68"
          stroke="url(#zendor-grad-white)"
          strokeWidth="10"
          strokeLinecap="round"
          variants={pathVariants}
          initial={animate ? "hidden" : "visible"}
          animate="visible"
        />

        {/* Inner Z - segment 2: Diagonal bar */}
        <motion.path
          d="M68 35 L32 65"
          stroke="url(#zendor-grad-orange)"
          strokeWidth="12"
          strokeLinecap="round"
          variants={pathVariants}
          initial={animate ? "hidden" : "visible"}
          animate="visible"
          transition={{ delay: 0.3 }}
        />

        {/* Inner Z - segment 3: Bottom bar */}
        <motion.path
          d="M32 65 H68"
          stroke="url(#zendor-grad-white)"
          strokeWidth="10"
          strokeLinecap="round"
          variants={pathVariants}
          initial={animate ? "hidden" : "visible"}
          animate="visible"
          transition={{ delay: 0.6 }}
        />

        {/* Custom definitions/gradients */}
        <defs>
          <linearGradient id="zendor-grad-orange" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
          <linearGradient id="zendor-grad-white" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
