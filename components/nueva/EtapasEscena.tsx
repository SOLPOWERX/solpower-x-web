"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";

const c01 = (v: number) => Math.min(1, Math.max(0, v));
/** Visible entre a y b, con entrada y salida suaves. */
export const ventana = (v: number, a: number, b: number, f = 0.04) => Math.min(c01((v - a) / f), c01((b - v) / f));

/** Margen izquierdo/derecho alineado con el contenido de la página. */
export const GI = "md:left-[max(1.25rem,calc((100vw-80rem)/2+1.25rem))]";
export const GD = "md:right-[max(1.25rem,calc((100vw-80rem)/2+1.25rem))]";

export type Etapa = {
  a: number;
  b: number;
  n: string;
  kicker: string;
  title: string;
  body: string;
  /** Clases de posición (cada paso en un lugar distinto para no tapar la animación). */
  pos: string;
  caja?: boolean;
  /** Cifra grande opcional, p. ej. "50 %". */
  cifra?: { valor: string; texto: string };
};

/** Texto de un paso sobre la escena 3D: aparece, sube despacio con el scroll y se va. */
export function EtapaEscena({ e, p }: { e: Etapa; p: MotionValue<number> }) {
  const o = useTransform(p, (v) => ventana(v, e.a, e.b));
  const y = useTransform(p, (v) => 60 - c01((v - e.a) / (Math.min(e.b, 1) - e.a)) * 90);
  return (
    <motion.div className={`pointer-events-none absolute ${e.pos}`} style={{ opacity: o, y }}>
      <div
        className={
          e.caja
            ? "rounded-[22px] bg-azul-950/45 p-5 ring-1 ring-inset ring-white/10 backdrop-blur-md md:p-6"
            : "border-l-2 border-sol-claro/80 pl-5 [text-shadow:0_2px_18px_rgba(4,15,38,.75)] max-md:rounded-2xl max-md:bg-azul-950/60 max-md:py-4 max-md:pr-4 max-md:backdrop-blur-sm"
        }
      >
        <p className="flex items-baseline gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-sol-claro md:text-sm">
          <span className="text-2xl font-extrabold tracking-normal text-white/90">{e.n}</span>
          {e.kicker}
        </p>
        {e.cifra && (
          <p className="mt-2 text-[clamp(2.6rem,6vw,4.4rem)] font-extrabold leading-none tracking-tight">
            <span className="bg-gradient-to-br from-sol to-sol-claro bg-clip-text text-transparent">{e.cifra.valor}</span>
            <span className="ml-2 align-middle text-sm font-semibold text-white/80">{e.cifra.texto}</span>
          </p>
        )}
        <h2 className="mt-2 text-2xl font-bold leading-tight text-white md:text-[1.8rem]">{e.title}</h2>
        <p className="mt-2 text-sm text-white/75 md:text-base">{e.body}</p>
      </div>
    </motion.div>
  );
}
