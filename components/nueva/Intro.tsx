"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const EVENTO = "sx:intro-listo";
const ease = [0.7, 0, 0.2, 1] as const;

/** Devuelve true cuando la animación de entrada ya abrió la página. */
export function useIntroListo() {
  const [listo, setListo] = useState(false);
  useEffect(() => {
    if ((window as unknown as { __sxIntro?: boolean }).__sxIntro) {
      setListo(true);
      return;
    }
    const on = () => setListo(true);
    window.addEventListener(EVENTO, on);
    return () => window.removeEventListener(EVENTO, on);
  }, []);
  return listo;
}

function abrir() {
  (window as unknown as { __sxIntro?: boolean }).__sxIntro = true;
  window.dispatchEvent(new Event(EVENTO));
}

/**
 * Animación de entrada: una línea de horizonte dorada, el logo sale como un sol
 * y la pantalla se abre en dos, como un amanecer.
 */
export default function Intro() {
  const [fase, setFase] = useState<"entra" | "sale" | "fin">("entra");

  useEffect(() => {
    // Solo la primera vez en cada visita: al volver de otra página no se repite
    let vista = false;
    try {
      vista = sessionStorage.getItem("sx-intro") === "1";
      sessionStorage.setItem("sx-intro", "1");
    } catch {}
    if (vista || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setFase("fin");
      abrir();
      return;
    }
    window.scrollTo(0, 0);
    document.documentElement.style.overflow = "hidden";
    const t1 = setTimeout(() => salir(), 2300);
    return () => clearTimeout(t1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function salir() {
    setFase((f) => (f === "entra" ? "sale" : f));
    abrir();
    setTimeout(() => {
      document.documentElement.style.overflow = "";
      setFase("fin");
    }, 1100);
  }

  const sale = fase === "sale";

  return (
    <AnimatePresence>
      {fase !== "fin" && (
        <div className="fixed inset-0 z-[100]" data-lenis-prevent>
          {/* Las dos mitades que se abren */}
          <motion.div
            className="absolute inset-x-0 top-0 h-1/2 bg-azul-950"
            animate={{ y: sale ? "-100%" : "0%" }}
            transition={{ duration: 1, ease }}
          />
          <motion.div
            className="absolute inset-x-0 bottom-0 h-1/2 bg-azul-950"
            animate={{ y: sale ? "100%" : "0%" }}
            transition={{ duration: 1, ease }}
          />

          <motion.div
            className="absolute inset-0"
            animate={{ opacity: sale ? 0 : 1, scale: sale ? 1.06 : 1 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            {/* Resplandor del amanecer */}
            <motion.div
              className="absolute left-1/2 top-1/2 h-[70vmin] w-[120vmin] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(255,194,61,.55)_0%,rgba(240,165,0,.18)_35%,transparent_68%)]"
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.55, duration: 1.4, ease: "easeOut" }}
            />

            {/* El logo sale por encima del horizonte, como el sol */}
            <div className="absolute bottom-1/2 left-1/2 h-28 w-32 -translate-x-1/2 overflow-hidden md:h-36 md:w-40">
              <motion.div
                className="relative h-full w-full"
                initial={{ y: "105%" }}
                animate={{ y: "4%" }}
                transition={{ delay: 0.5, duration: 1.1, ease: [0.2, 0.8, 0.2, 1] }}
              >
                <Image src="/isotipo.png" alt="" fill sizes="160px" priority className="object-contain" />
              </motion.div>
            </div>

            {/* Línea de horizonte: corriente que recorre de lado a lado */}
            <motion.div
              className="absolute left-0 right-0 top-1/2 h-px origin-center bg-gradient-to-r from-transparent via-sol-claro to-transparent shadow-[0_0_18px_2px_rgba(255,194,61,.7)]"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.1, duration: 0.9, ease }}
            />
            <motion.span
              className="absolute top-1/2 h-[3px] w-24 -translate-y-1/2 rounded-full bg-[#fff3cf] shadow-[0_0_20px_6px_rgba(255,194,61,.9)]"
              initial={{ left: "-10%" }}
              animate={{ left: "110%" }}
              transition={{ delay: 0.25, duration: 1.2, ease: "easeInOut" }}
            />

            {/* Nombre */}
            <div className="absolute left-1/2 top-[calc(50%+22px)] -translate-x-1/2 text-center text-white">
              <p className="flex overflow-hidden text-2xl font-extrabold tracking-[0.18em] md:text-3xl">
                {"SOLPOWER".split("").map((ch, i) => (
                  <motion.span
                    key={i}
                    className="inline-block"
                    initial={{ y: "-110%" }}
                    animate={{ y: 0 }}
                    transition={{ delay: 1.05 + i * 0.04, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
                  >
                    {ch}
                  </motion.span>
                ))}
                <motion.span
                  className="ml-2 inline-block text-sol-claro"
                  initial={{ y: "-110%", rotate: -90 }}
                  animate={{ y: 0, rotate: 0 }}
                  transition={{ delay: 1.45, type: "spring", stiffness: 220, damping: 14 }}
                >
                  X
                </motion.span>
              </p>
              <motion.p
                className="mt-3 text-xs uppercase tracking-[0.35em] text-white/60 md:text-sm"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6, duration: 0.6 }}
              >
                Haz del sol tu mejor inversión
              </motion.p>
            </div>
          </motion.div>

          {!sale && (
            <button
              type="button"
              onClick={salir}
              className="absolute bottom-6 right-6 rounded-full border border-white/20 px-4 py-2 text-xs font-medium text-white/60 transition-colors hover:border-sol hover:text-sol"
            >
              Saltar
            </button>
          )}
        </div>
      )}
    </AnimatePresence>
  );
}
