"use client";

import Image from "next/image";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion";
import { puertas } from "@/lib/nueva";

/** Tarjeta que se inclina en 3D siguiendo el mouse, con una luz que la recorre. */
function Puerta({ p, i }: { p: (typeof puertas)[number]; i: number }) {
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const sx = useSpring(mx, { stiffness: 160, damping: 18 });
  const sy = useSpring(my, { stiffness: 160, damping: 18 });
  const rotY = useTransform(sx, [0, 1], [-9, 9]);
  const rotX = useTransform(sy, [0, 1], [8, -8]);
  const lx = useTransform(sx, (v) => `${v * 100}%`);
  const ly = useTransform(sy, (v) => `${v * 100}%`);
  const luz = useMotionTemplate`radial-gradient(420px circle at ${lx} ${ly}, rgba(255,214,120,.28), transparent 55%)`;

  return (
    <motion.li
      className="[perspective:1200px]"
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ delay: i * 0.12, duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <motion.a
        href={p.href}
        className="group relative flex h-[30rem] flex-col justify-end overflow-hidden rounded-[28px] p-7 ring-1 ring-inset ring-white/15 md:h-[34rem]"
        style={{ rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d" }}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          mx.set((e.clientX - r.left) / r.width);
          my.set((e.clientY - r.top) / r.height);
        }}
        onMouseLeave={() => {
          mx.set(0.5);
          my.set(0.5);
        }}
      >
        <Image
          src={p.image}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, 100vw"
          className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
        />
        <span className="absolute inset-0 bg-gradient-to-t from-azul-950 via-azul-950/55 to-azul-950/5" />
        <motion.span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: luz }} />

        <span className="relative" style={{ transform: "translateZ(40px)" }}>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-sol-claro">{p.kicker}</span>
          <span className="mt-2 block text-4xl font-bold">{p.title}</span>
          <span className="mt-2 block max-w-xs text-white/75">{p.body}</span>
          <span className="mt-5 grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-out group-hover:grid-rows-[1fr] max-lg:grid-rows-[1fr]">
            <span className="overflow-hidden">
              <ul className="space-y-2 pb-5 text-sm text-white/85">
                {p.points.map((pt) => (
                  <li key={pt} className="flex gap-2">
                    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-sol" />
                    {pt}
                  </li>
                ))}
              </ul>
            </span>
          </span>
          <span className="inline-flex items-center gap-3 rounded-full bg-white/10 py-1.5 pl-5 pr-1.5 text-sm font-semibold backdrop-blur-md ring-1 ring-inset ring-white/20 transition-colors duration-300 group-hover:bg-sol group-hover:text-azul-950">
            {p.cta}
            <span className="grid h-8 w-8 place-items-center rounded-full bg-sol text-azul-950 transition-colors duration-300 group-hover:bg-azul-950 group-hover:text-sol-claro">
              →
            </span>
          </span>
        </span>
      </motion.a>
    </motion.li>
  );
}

export default function Puertas() {
  return (
    <section id="puertas" className="relative bg-azul-950 pb-24 pt-10 text-white md:pb-32">
      <div className="mx-auto max-w-7xl px-5">
        <motion.div
          className="flex flex-col justify-between gap-4 md:flex-row md:items-end"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="title max-w-xl">
            ¿Para quién es <span className="text-sol">su proyecto?</span>
          </h2>
          <p className="max-w-sm text-white/65">Elija su camino y le mostramos solo lo que le sirve.</p>
        </motion.div>
        <ul className="mt-12 grid gap-5 lg:grid-cols-3">
          {puertas.map((p, i) => (
            <Puerta key={p.title} p={p} i={i} />
          ))}
        </ul>
      </div>
    </section>
  );
}
