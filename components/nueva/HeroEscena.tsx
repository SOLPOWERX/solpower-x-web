"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useIntroListo } from "./Intro";

const EscenaSolar = dynamic(() => import("./escena/EscenaSolar"), { ssr: false });

const c01 = (v: number) => Math.min(1, Math.max(0, v));
/** Visible entre a y b, con entrada y salida suaves. */
const ventana = (v: number, a: number, b: number, f = 0.04) => Math.min(c01((v - a) / f), c01((b - v) / f));

const G = "md:left-[max(1.25rem,calc((100vw-80rem)/2+1.25rem))]";

/**
 * Cada paso aparece en un lugar distinto para no tapar la animación,
 * y se desliza mientras se baja para moverse junto con la escena.
 */
const etapas = [
  {
    a: 0.17, b: 0.33, n: "01", kicker: "Estudio", title: "Todo empieza con su factura", body: "Medimos su consumo y su espacio antes de diseñar.",
    pos: `inset-x-5 bottom-12 md:inset-x-auto md:bottom-[13%] md:w-[23rem] ${G}`, caja: false, chico: false,
  },
  {
    a: 0.4, b: 0.62, n: "02", kicker: "Diseño", title: "Cada capa, calculada", body: "Simulación PVsyst y componentes de marcas reconocidas.",
    pos: `inset-x-5 top-24 md:inset-x-auto md:top-[16%] md:w-[19rem] ${G}`, caja: false, chico: false,
  },
  {
    a: 0.66, b: 0.8, n: "03", kicker: "Instalación", title: "Montaje sin detener su operación", body: "Personal certificado y estructura para más de 25 años.",
    pos: `inset-x-5 bottom-10 md:inset-x-auto md:bottom-auto md:top-1/2 md:w-[26rem] md:-translate-y-1/2 ${G}`, caja: true, chico: false,
  },
  {
    a: 0.84, b: 1.1, n: "04", kicker: "Certificación y conexión", title: "Del sol a su empresa", body: "Certificación RETIE y legalización ante el operador de red.",
    pos: `inset-x-5 top-24 md:inset-x-auto md:top-[15%] md:w-[19rem] ${G}`, caja: true, chico: true,
  },
];

function Etapa({ e, p }: { e: (typeof etapas)[number]; p: MotionValue<number> }) {
  const o = useTransform(p, (v) => ventana(v, e.a, e.b));
  // Sube despacio mientras está visible, como si estuviera en la escena
  const y = useTransform(p, (v) => 60 - c01((v - e.a) / (Math.min(e.b, 1) - e.a)) * 90);
  const chico = !e.caja || e.chico;
  return (
    <motion.div className={`pointer-events-none absolute ${e.pos}`} style={{ opacity: o, y }}>
      <div
        className={
          e.caja
            ? `rounded-[22px] bg-azul-950/45 ring-1 ring-inset ring-white/10 backdrop-blur-md ${e.chico ? "p-5" : "p-6 md:p-7"}`
            : "border-l-2 border-sol-claro/80 pl-5 [text-shadow:0_2px_18px_rgba(4,15,38,.75)]"
        }
      >
        <p className="flex items-baseline gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-sol-claro md:text-sm">
          <span className={`font-extrabold tracking-normal text-white/90 ${chico ? "text-2xl" : "text-3xl"}`}>{e.n}</span>
          {e.kicker}
        </p>
        <h2 className={`mt-2 font-bold leading-tight text-white ${chico ? "text-2xl md:text-[1.7rem]" : "text-2xl md:text-4xl"}`}>{e.title}</h2>
        <p className={`mt-2 text-white/75 ${chico ? "text-sm" : ""}`}>{e.body}</p>
      </div>
    </motion.div>
  );
}

/** Portada: una sola escena 3D que cambia mientras se baja. */
export default function HeroEscena() {
  const root = useRef<HTMLElement>(null);
  const raton = useRef({ x: 0, y: 0 });
  const listo = useIntroListo();
  const [movil, setMovil] = useState(false);
  const [paso, setPaso] = useState(-1);

  const { scrollYProgress: p } = useScroll({ target: root, offset: ["start start", "end end"] });
  const tituloO = useTransform(p, (v) => 1 - c01((v - 0.06) / 0.07));
  const tituloY = useTransform(p, (v) => -c01(v / 0.13) * 80);
  const barra = useTransform(p, (v) => c01(v));
  useMotionValueEvent(p, "change", (v) => setPaso(etapas.findIndex((e) => v >= e.a - 0.02 && v <= e.b)));

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const on = () => setMovil(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  const show = (delay: number) => ({
    initial: { opacity: 0, y: 30, filter: "blur(8px)" },
    animate: listo ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined,
    transition: { delay, duration: 1, ease: [0.2, 0.8, 0.2, 1] as const },
  });

  return (
    <section
      id="inicio"
      ref={root}
      className="relative h-[520vh] bg-azul-950"
      onMouseMove={(e) => {
        raton.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
        raton.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
      }}
    >
      <div className="sticky top-0 h-svh overflow-hidden text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,#5a2f1c_0%,#0b1733_55%,#040f26_100%)]" />
        <div className="absolute inset-0">
          <EscenaSolar progress={p} raton={raton} listo={listo} movil={movil} />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-azul-950/50 via-transparent to-azul-950/40" />

        {/* Título inicial */}
        <motion.div
          className="pointer-events-none absolute inset-x-0 top-[22%] mx-auto max-w-7xl px-5 text-center md:top-1/2 md:-translate-y-1/2 md:text-left"
          style={{ opacity: tituloO, y: tituloY }}
        >
          <motion.p
            {...show(0.2)}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs backdrop-blur-md md:text-sm"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sol-claro" />
            Energía solar e ingeniería eléctrica en toda Colombia
          </motion.p>
          <h1 className="text-[clamp(2.6rem,7vw,6.2rem)] font-bold leading-[1.02] tracking-tight drop-shadow-[0_6px_30px_rgba(4,15,38,.5)]">
            {[["Haz", "del", "sol", "tu"], ["mejor", "inversión"]].map((line, l) => (
              <span key={l} className="block">
                {line.map((w, i) => (
                  <span key={w} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                    <motion.span
                      className={`mr-[0.25em] inline-block ${l ? "bg-gradient-to-r from-sol to-sol-claro bg-clip-text text-transparent" : ""}`}
                      initial={{ y: "110%" }}
                      animate={listo ? { y: 0 } : undefined}
                      transition={{ delay: 0.3 + (l * 4 + i) * 0.08, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {w}
                    </motion.span>
                  </span>
                ))}
              </span>
            ))}
          </h1>
        </motion.div>

        {/* Los cuatro pasos aparecen sobre la escena */}
        {etapas.map((e) => (
          <Etapa key={e.n} e={e} p={p} />
        ))}

        {/* Avance: puntos de los pasos */}
        <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 items-center gap-4 md:flex">
          {etapas.map((e, i) => (
            <span key={e.n} className="flex items-center gap-2 text-xs font-semibold">
              <span className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${paso === i ? "max-w-48 text-sol-claro opacity-100" : "max-w-0 opacity-0"}`}>{e.kicker}</span>
              <span className={`h-2 rounded-full transition-all duration-300 ${paso === i ? "w-6 bg-sol-claro" : "w-2 bg-white/40"}`} />
            </span>
          ))}
        </div>
        <div className="absolute inset-x-0 bottom-0 h-[2px] bg-white/10">
          <motion.span className="block h-full origin-left bg-gradient-to-r from-sol to-sol-claro" style={{ scaleX: barra }} />
        </div>

        <motion.div className="absolute bottom-6 left-1/2 -translate-x-1/2" style={{ opacity: tituloO }}>
        <motion.div className="flex flex-col items-center gap-2 text-xs text-white/70" {...show(1.2)}>
          Baje para recorrer la planta
          <span className="grid h-10 w-6 justify-center rounded-full border-2 border-white/50 pt-1.5">
            <span className="h-2 w-1 animate-bounce rounded-full bg-white" />
          </span>
        </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
