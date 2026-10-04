"use client";

import { motion } from "framer-motion";

export default function AILoading() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="rounded-2xl md:rounded-3xl bg-white/90 backdrop-blur-md border border-blue-100 shadow-xl shadow-blue-100/40 p-8 md:p-12 flex flex-col items-center text-center">
        {/* Animated AI orb — pulsing gradient ring with sparkle */}
        <div className="relative w-20 h-20 md:w-24 md:h-24 mb-6">
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-br from-[#1D4ED8] via-[#3B82F6] to-[#93C5FD]"
            animate={{
              scale: [1, 1.08, 1],
              opacity: [0.85, 1, 0.85],
            }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute inset-1.5 rounded-full bg-white"
            animate={{ opacity: [0.95, 0.85, 0.95] }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          >
            <svg
              className="w-9 h-9 md:w-11 md:h-11 text-[#1D4ED8]"
              viewBox="0 0 24 24"
              fill="none"
            >
              {/* Stylized 4-point sparkle */}
              <path
                d="M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z"
                fill="currentColor"
              />
            </svg>
          </motion.div>
        </div>

        <p className="font-display font-medium text-lg md:text-xl text-[#1D4ED8] mb-1">
          L&apos;intelligence artificielle
        </p>
        <h2 className="font-display text-2xl md:text-3xl text-[#0B1F4D] leading-tight mb-3">
          calcule votre potentiel…
        </h2>

        <p className="text-slate-500 text-sm md:text-base max-w-md leading-relaxed">
          Nous croisons vos réponses avec les données du marché touristique pour estimer vos
          revenus optimisés.
        </p>

        {/* Animated dots */}
        <div className="flex items-center gap-2 mt-6">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-2 h-2 rounded-full bg-[#1D4ED8]"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
