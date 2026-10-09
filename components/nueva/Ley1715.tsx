"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView } from "framer-motion";
import { incentives } from "@/lib/content";
import { imagenLey1715 } from "@/lib/nueva";

/** Franja de beneficios tributarios de la Ley 1715. */
export default function Ley1715() {
  const ref = useRef<HTMLDivElement>(null);
  const visto = useInView(ref, { once: true, margin: "-20%" });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!visto) return;
    const c = animate(0, 50, { duration: 2, ease: [0.2, 0.8, 0.2, 1], onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [visto]);

  return (
    <section id="ley-1715" className="relative overflow-hidden bg-azul-950 py-24 text-white md:py-32">
      <span aria-hidden className="absolute -left-40 top-0 h-[40rem] w-[40rem] rounded-full bg-[radial-gradient(circle,rgba(240,165,0,.22),transparent_65%)]" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-[.9fr_1.1fr]">
        <div ref={ref}>
          <p className="mb-4 font-semibold text-sol">Beneficios Ley 1715</p>
          <p className="text-[clamp(5rem,14vw,10rem)] font-extrabold leading-none tracking-tight">
            <span className="bg-gradient-to-br from-sol to-sol-claro bg-clip-text text-transparent">{n}</span>
            <span className="text-sol-claro">%</span>
          </p>
          <p className="mt-4 max-w-md text-xl font-semibold leading-snug">
            de su inversión se puede deducir de la renta. El Estado le ayuda a pagar su sistema solar.
          </p>
          <p className="mt-4 max-w-md text-sm text-white/55">
            Requiere certificación de la UPME. Le acompañamos en todo el trámite.
          </p>
          <motion.img
            src={imagenLey1715}
            alt=""
            className="mt-8 w-full max-w-md"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
          />
        </div>

        <ul className="grid gap-4 sm:grid-cols-2">
          {incentives.map((it, i) => (
            <motion.li
              key={it.title}
              className="rounded-[24px] bg-white/[.05] p-6 ring-1 ring-inset ring-white/10 backdrop-blur-sm transition-colors duration-300 hover:bg-white/[.09]"
              initial={{ opacity: 0, y: 40, rotateX: -25 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ delay: i * 0.1, duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <span className="grid h-10 w-10 place-items-center rounded-full bg-sol/15 text-sm font-bold text-sol-claro">0{i + 1}</span>
              <h3 className="mt-4 text-lg font-semibold">{it.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/65">{it.body}</p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
