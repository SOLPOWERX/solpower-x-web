"use client";

import { useEffect, useRef, useState, type ComponentType, type MutableRefObject, type ReactNode } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { EtapaEscena, type Etapa } from "./EtapasEscena";

const c01 = (v: number) => Math.min(1, Math.max(0, v));

export type PropsEscena = { progress: MotionValue<number>; raton: MutableRefObject<{ x: number; y: number }>; movil: boolean };

/**
 * Portada de una página interna: escena 3D fija mientras se baja, título con botones al inicio
 * y los pasos encima de la escena.
 */
export default function HeroPagina({
  Escena,
  etapas,
  kicker,
  lineas,
  botones,
  pista,
}: {
  Escena: ComponentType<PropsEscena>;
  etapas: Etapa[];
  kicker: string;
  /** Líneas del título; la última va en dorado. */
  lineas: string[][];
  botones: ReactNode;
  pista: string;
}) {
  const root = useRef<HTMLElement>(null);
  const raton = useRef({ x: 0, y: 0 });
  const [movil, setMovil] = useState(false);
  const { scrollYProgress: p } = useScroll({ target: root, offset: ["start start", "end end"] });
  const tituloO = useTransform(p, (v) => 1 - c01((v - 0.07) / 0.06));
  const tituloY = useTransform(p, (v) => -c01(v / 0.13) * 80);
  const barra = useTransform(p, (v) => c01(v));

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const on = () => setMovil(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  const entra = (delay: number) => ({
    initial: { opacity: 0, y: 30, filter: "blur(8px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: { delay, duration: 1, ease: [0.2, 0.8, 0.2, 1] as const },
  });
  const ultima = lineas.length - 1;

  return (
    <section
      ref={root}
      className="relative h-[520vh] bg-azul-950"
      onMouseMove={(e) => {
        raton.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
        raton.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
      }}
    >
      <div className="sticky top-0 h-svh overflow-hidden text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,#0a2a5c_0%,#061736_55%,#040f26_100%)]" />
        <div className="absolute inset-0">
          <Escena progress={p} raton={raton} movil={movil} />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-azul-950/55 via-transparent to-azul-950/40" />

        <motion.div
          className="absolute inset-x-0 top-[20%] mx-auto max-w-7xl px-5 text-center md:top-1/2 md:-translate-y-1/2 md:text-left"
          style={{ opacity: tituloO, y: tituloY }}
        >
          <motion.p
            {...entra(0.1)}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs backdrop-blur-md md:text-sm"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sol-claro" />
            {kicker}
          </motion.p>
          <h1 className="text-[clamp(2.6rem,7vw,6rem)] font-bold leading-[1.02] tracking-tight drop-shadow-[0_6px_30px_rgba(4,15,38,.5)]">
            {lineas.map((line, l) => (
              <span key={l} className="block">
                {line.map((w, i) => (
                  <span key={w} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                    <motion.span
                      className={`mr-[0.25em] inline-block ${l === ultima ? "bg-gradient-to-r from-sol to-sol-claro bg-clip-text text-transparent" : ""}`}
                      initial={{ y: "110%" }}
                      animate={{ y: 0 }}
                      transition={{ delay: 0.2 + (l * 3 + i) * 0.08, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {w}
                    </motion.span>
                  </span>
                ))}
              </span>
            ))}
          </h1>
          <motion.div {...entra(0.75)} className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center md:justify-start">
            {botones}
          </motion.div>
        </motion.div>

        {etapas.map((e) => (
          <EtapaEscena key={e.n} e={e} p={p} />
        ))}

        <div className="absolute inset-x-0 bottom-0 h-[2px] bg-white/10">
          <motion.span className="block h-full origin-left bg-gradient-to-r from-sol to-sol-claro" style={{ scaleX: barra }} />
        </div>
        <motion.div className="absolute bottom-6 left-1/2 -translate-x-1/2" style={{ opacity: tituloO }}>
          <motion.div className="flex flex-col items-center gap-2 text-xs text-white/70" {...entra(1.2)}>
            {pista}
            <span className="grid h-10 w-6 justify-center rounded-full border-2 border-white/50 pt-1.5">
              <span className="h-2 w-1 animate-bounce rounded-full bg-white" />
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
