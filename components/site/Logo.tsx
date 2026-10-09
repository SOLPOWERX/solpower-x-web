"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const word = "SOLPOWER".split("");

/**
 * Logo animado: el isotipo entra girando con un sol que se enciende detrás y las letras aparecen una a una.
 * Con `circulo={false}` el isotipo va solo, sin el círculo blanco ni el sol de fondo (para menús claros).
 */
export default function Logo({ light = true, size = 40, circulo = true }: { light?: boolean; size?: number; circulo?: boolean }) {
  return (
    <span className="group flex items-center gap-2.5">
      <span className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }}>
        {/* Halo de sol que late */}
        {circulo && (<>
        <motion.span
          aria-hidden
          className="absolute inset-[-35%] rounded-full bg-[radial-gradient(circle,rgba(255,194,61,.75)_0%,rgba(240,165,0,.25)_45%,transparent_70%)]"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.25, 1], opacity: [0, 1, 0.7] }}
          transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
        />
        <motion.span
          aria-hidden
          className="absolute inset-[-40%] rounded-full bg-[radial-gradient(circle,rgba(255,194,61,.85)_0%,rgba(240,165,0,.35)_35%,transparent_65%)]"
          animate={{ scale: [1, 1.3, 1], opacity: [0.85, 0.35, 0.85] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        />
        {/* Rayos de sol que giran lentamente */}
        <motion.span
          aria-hidden
          className="absolute inset-[-34%] rounded-full bg-[repeating-conic-gradient(rgba(255,194,61,.95)_0deg_5deg,transparent_5deg_30deg)] [mask-image:radial-gradient(circle,transparent_52%,#000_56%,#000_68%,transparent_72%)]"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1, rotate: 360 }}
          transition={{
            opacity: { delay: 0.6, duration: 0.8 },
            scale: { delay: 0.6, duration: 0.8, ease: "backOut" },
            rotate: { duration: 16, repeat: Infinity, ease: "linear" },
          }}
        />
        </>)}
        <motion.span
          className={`relative grid h-full w-full place-items-center transition-transform duration-500 group-hover:rotate-[-12deg] group-hover:scale-110 ${
            circulo ? "rounded-full bg-white p-[14%] shadow-[0_4px_14px_-4px_rgba(13,43,94,.45)]" : ""
          }`}
          initial={{ rotate: -200, scale: 0.3, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 12, delay: 0.1 }}
        >
          <Image src="/isotipo.png" alt="" width={size} height={size} priority className="h-auto w-full" />
        </motion.span>
      </span>

      <span
        className={`flex items-baseline whitespace-nowrap transition-colors duration-500 ${
          circulo ? "text-[1.15rem] font-extrabold tracking-[0.04em]" : "text-[0.98rem] font-semibold tracking-[0.02em]"
        } ${light ? "text-white" : "text-azul"}`}
        aria-label="SOLPOWER X"
      >
        {word.map((ch, i) => (
          <motion.span
            key={i}
            aria-hidden
            className="inline-block"
            initial={{ y: "110%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.45 + i * 0.045, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
          >
            {ch}
          </motion.span>
        ))}
        <motion.span
          aria-hidden
          className={`logo-x inline-block bg-[linear-gradient(110deg,#f0a500_35%,#fff6d6_50%,#f0a500_65%)] bg-[length:250%_100%] bg-clip-text leading-none text-transparent ${
            circulo ? "ml-1.5 text-[1.3em]" : "ml-1 text-[1em] font-bold"
          }`}
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.95, type: "spring", stiffness: 260, damping: 14 }}
        >
          X
        </motion.span>
      </span>
    </span>
  );
}
