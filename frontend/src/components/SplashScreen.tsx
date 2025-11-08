import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Start the fade out animation after 4 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 4000);

    // Complete the splash screen after fade out animation
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950"
      initial={{ opacity: 0 }}
      animate={{
        opacity: showSplash ? 1 : 0,
      }}
      transition={{
        duration: showSplash ? 0.8 : 1,
        ease: "easeInOut",
      }}
    >
      {/* Background overlay for better contrast */}
      <motion.div
        className="absolute inset-0 bg-black/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      />

      {/* Main logo container */}
      <motion.div
        className="relative z-10 flex flex-col items-center justify-center space-y-4"
        initial={{ opacity: 0, scale: 0.5, y: 50 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        transition={{
          delay: 0.5,
          duration: 0.8,
          ease: "easeOut",
        }}
      >
        {/* Professional Government Logo */}
        <motion.div
          className="relative"
          initial={{ rotate: -5, scale: 0.8 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{
            delay: 0.8,
            duration: 0.6,
            ease: "easeOut",
          }}
        >
          {/* Main logo */}
          <motion.div
            className="relative w-56 h-56 md:w-64 md:h-64 bg-white rounded-full flex items-center justify-center shadow-2xl ring-4 ring-yellow-400/40 border-4 border-white/20 overflow-hidden"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
          >
            <motion.img
              src="/op.png"
              alt="Odisha Police Official Logo"
              className="w-40 h-40 md:w-44 md:h-44 object-contain rounded-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.5 }}
            />
          </motion.div>

          {/* Professional glow effect */}
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400/20 to-blue-400/20 blur-2xl -z-10"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.3, opacity: 1 }}
            transition={{
              delay: 1.3,
              duration: 0.8,
              ease: "easeOut",
            }}
          />
        </motion.div>

        {/* Title text with typing effect */}
        <motion.div
          className="text-center space-y-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.6 }}
        >
          <motion.h1
            className="text-3xl md:text-4xl font-bold text-white tracking-wider text-center drop-shadow-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.7, duration: 0.8 }}
          >
            ODISHA POLICE
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-yellow-100 font-semibold text-center drop-shadow-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.9, duration: 0.8 }}
          >
            Court Attendance System
          </motion.p>

          <motion.p
            className="text-base md:text-lg text-white font-medium text-center drop-shadow-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.0, duration: 0.8 }}
          >
            Government of Odisha
          </motion.p>

          <motion.p
            className="text-xs text-gray-300 italic text-center mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.1, duration: 0.6 }}
          >
            "सत्यमेव जयते" • Truth Alone Triumphs
          </motion.p>
        </motion.div>

        {/* Loading indicator */}
        <motion.div
          className="flex space-x-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.1, duration: 0.5 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-white rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>
      </motion.div>

      {/* Animated particles for extra flair */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, -100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeOut",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default SplashScreen;
