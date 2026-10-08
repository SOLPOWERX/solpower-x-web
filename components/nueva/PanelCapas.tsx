"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { pasosPanel } from "@/lib/nueva";
import Panel3D from "./Panel3D";

/** 0 antes de `a`, 1 después de `b`, lineal entre ambos. */
const entre = (v: number, a: number, b: number) => Math.min(1, Math.max(0, (v - a) / (b - a)));

/**
 * El panel se desarma en capas mientras la persona baja (estilo "producto que explota")
 * y cada etapa del scroll cuenta un paso del proyecto.
 */
export default function PanelCapas() {
  const root = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useScroll({ target: root, offset: ["start start", "end end"] });

  const gap = useTransform(p, [0, 0.14, 0.4, 0.66, 0.86], [3, 3, 48, 48, 3]);
  // Funciones (no rangos) para que framer no lo pase a ScrollTimeline nativo, que aquí no se actualiza
  const labels = useTransform(p, (v) => Math.min(entre(v, 0.3, 0.4), 1 - entre(v, 0.6, 0.68)));
  const rotZ = useTransform(p, [0, 1], [-50, -26]);
  const rotX = useTransform(p, [0, 0.45, 1], [64, 55, 60]);
  const sello = useTransform(p, (v) => entre(v, 0.84, 0.94));
  const selloS = useTransform(p, (v) => 0.6 + 0.4 * entre(v, 0.84, 0.94));
  const barra = useTransform(p, [0.02, 0.98], [0, 1]);
  const gapCel = useTransform(gap, (g) => g * 0.5);

  const [paso, setPaso] = useState(0);
  useMotionValueEvent(p, "change", (v) => setPaso(Math.min(3, Math.max(0, Math.floor(v * 4)))));

  return (
    <section id="proceso" ref={root} className="relative h-[420vh] bg-azul-950 text-white">
      <div className="sticky top-0 flex h-svh items-center overflow-hidden">
        <span aria-hidden className="absolute left-1/2 top-1/2 h-[80vmin] w-[80vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(59,130,196,.22),transparent_65%)] lg:left-[68%]" />

        {/* Número gigante de fondo */}
        <AnimatePresence mode="wait">
          <motion.span
            key={paso}
            aria-hidden
            className="texto-contorno pointer-events-none absolute -bottom-10 right-4 select-none text-[38vmin] font-extrabold leading-none lg:right-10"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -60 }}
            transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
          >
            0{paso + 1}
          </motion.span>
        </AnimatePresence>

        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-6 px-5 lg:grid-cols-[1fr_1.1fr]">
          <div className="order-last lg:order-first">
            <p className="mb-3 font-semibold text-sol">Cómo trabajamos</p>
            <h2 className="title max-w-md">
              De su factura a su <span className="text-sol">sistema funcionando</span>
            </h2>

            {/* Escritorio: los cuatro pasos con barra de avance */}
            <ol className="relative mt-10 hidden space-y-1 pl-6 lg:block">
              <span className="absolute bottom-2 left-0 top-2 w-[2px] rounded-full bg-white/10" />
              <motion.span
                className="absolute bottom-2 left-0 top-2 w-[2px] origin-top rounded-full bg-gradient-to-b from-sol to-sol-claro shadow-[0_0_12px_rgba(255,194,61,.8)]"
                style={{ scaleY: barra }}
              />
              {pasosPanel.map((s, i) => {
                const on = i === paso;
                return (
                  <li key={s.title} className={`transition-all duration-500 ${on ? "opacity-100" : "opacity-35"}`}>
                    <p className="flex items-baseline gap-3 py-2 text-xl font-semibold">
                      <span className={`text-sm transition-colors ${on ? "text-sol" : "text-white/60"}`}>0{i + 1}</span>
                      {s.title}
                    </p>
                    <div className={`grid transition-[grid-template-rows] duration-500 ${on ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                      <p className="overflow-hidden pl-8 text-white/70">
                        <span className="block pb-3">{s.body}</span>
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>

            {/* Celular: solo el paso actual */}
            <div className="mt-6 min-h-[8.5rem] lg:hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={paso}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35 }}
                >
                  <p className="flex items-baseline gap-3 text-lg font-semibold">
                    <span className="text-sm text-sol">0{paso + 1}</span>
                    {pasosPanel[paso].title}
                  </p>
                  <p className="mt-2 text-white/70">{pasosPanel[paso].body}</p>
                </motion.div>
              </AnimatePresence>
              <div className="mt-4 h-[2px] w-full overflow-hidden rounded-full bg-white/10">
                <motion.span className="block h-full origin-left bg-sol" style={{ scaleX: barra }} />
              </div>
            </div>
          </div>

          <div className="relative grid h-[40svh] place-items-center pt-10 lg:h-[80svh] lg:pt-0">
            <div className="lg:hidden">
              <Panel3D width="min(28vw,120px)" rotX={rotX} rotZ={rotZ} gap={gapCel} />
            </div>
            <div className="hidden -translate-x-16 lg:block">
              <Panel3D width="min(16vw,230px)" rotX={rotX} rotZ={rotZ} gap={gap} labels={labels} />
            </div>

            {/* Sello final: certificado */}
            <motion.div
              className="absolute right-[6%] top-[18%] grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-sol to-sol-claro text-center text-azul-950 shadow-[0_0_60px_rgba(255,194,61,.6)] md:h-32 md:w-32"
              style={{ opacity: sello, scale: selloS }}
            >
              <span>
                <svg width="30" height="30" viewBox="0 0 24 24" className="mx-auto" aria-hidden>
                  <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="mt-1 block text-sm font-extrabold leading-tight">
                  RETIE
                  <br />
                  <span className="text-[0.7rem] font-semibold">certificado</span>
                </span>
              </span>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
