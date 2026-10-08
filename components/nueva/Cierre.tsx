"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { cierre, waEmpresas } from "@/lib/nueva";

/** Cierre con imagen 3D de fondo: la invitación a enviar la factura. */
export default function Cierre() {
  const root = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: root, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1.25, 1]);
  const clip = useTransform(scrollYProgress, (v) => {
    const k = 1 - Math.min(1, v / 0.4);
    return `inset(${8 * k}% ${6 * k}% ${8 * k}% ${6 * k}% round ${40 * k}px)`;
  });

  return (
    <section ref={root} className="relative bg-white">
      <motion.div className="relative overflow-hidden bg-azul-950 text-white" style={{ clipPath: clip }}>
        <motion.div className="absolute inset-0" style={{ scale }} aria-hidden>
          <Image src={cierre.imagen} alt="" fill sizes="100vw" className="object-cover" />
        </motion.div>
        <span className="absolute inset-0 bg-azul-950/60" />
        <div className="relative mx-auto flex min-h-[80svh] max-w-4xl flex-col items-center justify-center px-5 py-24 text-center">
          <h2 className="text-[clamp(2.2rem,5.5vw,4.4rem)] font-bold leading-[1.05] tracking-tight">
            Envíenos su factura.
            <br />
            <span className="bg-gradient-to-r from-sol to-sol-claro bg-clip-text text-transparent">Le decimos cuánto puede ahorrar.</span>
          </h2>
          <p className="mt-6 max-w-xl text-lg text-white/75">Una foto por WhatsApp basta. El estudio no tiene costo.</p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a href={waEmpresas} target="_blank" rel="noopener noreferrer" className="btn-sol shine">
              Enviar por WhatsApp
            </a>
            <a href="#contacto" className="btn-ghost">
              Llenar el formulario
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
