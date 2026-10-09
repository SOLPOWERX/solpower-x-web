"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { cierre, waEmpresas } from "@/lib/nueva";

/** Cierre: la invitación a enviar la factura y, debajo, la ilustración de los tres pasos. */
export default function Cierre() {
  const root = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: root, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 0.5], [60, 0]);
  const clip = useTransform(scrollYProgress, (v) => {
    const k = 1 - Math.min(1, v / 0.4);
    return `inset(${8 * k}% ${6 * k}% ${8 * k}% ${6 * k}% round ${40 * k}px)`;
  });

  return (
    <section ref={root} className="relative bg-white">
      <motion.div
        className="relative overflow-hidden bg-gradient-to-b from-azul-950 via-[#0a2149] to-azul-950 text-white"
        style={{ clipPath: clip }}
      >
        <div className="relative mx-auto flex max-w-6xl flex-col items-center px-5 pb-16 pt-24 text-center md:pb-20">
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
          <motion.div className="mt-14 w-full" style={{ y }}>
            <Image
              src={cierre.imagen}
              alt="Usted envía la foto de su factura, le mostramos cuánto baja con energía solar y su techo empieza a producir."
              width={1600}
              height={660}
              unoptimized
              className="h-auto w-full"
            />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
