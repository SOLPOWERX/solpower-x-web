"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/** Botón fijo para volver al inicio de la página después de bajar. */
export default function VolverArriba() {
  const [ver, setVer] = useState(false);

  useEffect(() => {
    const on = () => setVer(window.scrollY > 900);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <AnimatePresence>
      {ver && (
        <motion.a
          href="#inicio"
          className="fixed bottom-5 left-5 z-50 inline-flex items-center gap-2 rounded-full bg-azul-950/85 py-2.5 pl-3 pr-4 text-sm font-semibold text-white shadow-lg ring-1 ring-inset ring-white/15 backdrop-blur-md transition-colors hover:bg-sol hover:text-azul-950"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
            <path d="M3 10l5-5 5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Inicio
        </motion.a>
      )}
    </AnimatePresence>
  );
}
