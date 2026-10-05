"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const PHOTOS = [
  { src: "/photos/chalet-1.jpg", sector: "Laurentides" },
  { src: "/photos/chalet-2.jpg", sector: "Gatineau" },
  { src: "/photos/chalet-3.jpg", sector: "Estrie" },
  { src: "/photos/chalet-7.jpg", sector: "Laurentides" },
  { src: "/photos/chalet-4.jpg", sector: "Montréal" },
  { src: "/photos/chalet-5.jpg", sector: "Québec" },
];

type Props = {
  questionCount: number;
  onStart: () => void;
};

function PhotoCard({ src, sector }: { src: string; sector: string }) {
  return (
    <div className="relative shrink-0 w-56 h-72 md:w-72 md:h-96 rounded-3xl overflow-hidden shadow-xl shadow-blue-900/15">
      <Image
        src={src}
        alt={`Propriété locative, secteur ${sector}`}
        fill
        sizes="(min-width: 768px) 288px, 224px"
        className="object-cover"
      />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent" />
      <span className="absolute left-3 bottom-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs md:text-sm font-semibold text-[#0B1F4D] shadow">
        <svg className="w-3.5 h-3.5 text-[#003DA5]" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M10 18s6-5.2 6-10A6 6 0 1 0 4 8c0 4.8 6 10 6 10Zm0-7.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
            clipRule="evenodd"
          />
        </svg>
        {sector}
      </span>
    </div>
  );
}

export default function Landing({ questionCount, onStart }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4 }}
      className="w-full flex flex-col items-center"
    >
      <div className="w-full max-w-3xl mx-auto text-center">
        <h1 className="font-display text-4xl md:text-6xl font-bold text-[#0B1F4D] leading-[1.05]">
          Découvrez comment maximiser le potentiel de votre{" "}
          <span className="text-[#003DA5]">Airbnb</span>
        </h1>
        <p className="text-slate-600 text-base md:text-lg mt-4 md:mt-5 max-w-xl mx-auto leading-relaxed">
          Répondez à {questionCount} questions rapides et voyez combien votre
          propriété pourrait vous rapporter de plus, par mois et par saison.
        </p>
        <button
          type="button"
          onClick={onStart}
          className="mt-7 inline-flex items-center gap-2 px-7 md:px-9 py-3.5 md:py-4 rounded-full bg-[#003DA5] text-white text-base md:text-lg font-semibold shadow-xl shadow-blue-300/60 hover:bg-[#1E3A8A] hover:-translate-y-0.5 transition-all"
        >
          Calculer mon potentiel
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
            <path
              d="M4 10h12m0 0l-4-4m4 4l-4 4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <p className="text-xs text-slate-500 mt-3">
          Gratuit · 2 minutes · Sans engagement
        </p>
      </div>

      {/* Full-bleed marquee: the list is doubled so the -50% loop is seamless */}
      <div className="marquee relative w-screen mt-10 md:mt-14 overflow-hidden">
        <div className="marquee-track flex gap-4 md:gap-6 w-max py-4">
          {[...PHOTOS, ...PHOTOS].map((p, i) => (
            <PhotoCard key={i} src={p.src} sector={p.sector} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
