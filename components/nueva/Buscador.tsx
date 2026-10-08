"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { necesidades } from "@/lib/nueva";

/** "¿Qué necesita?": el cliente elige su problema y ve la solución al instante. */
export default function Buscador() {
  const [sel, setSel] = useState(0);
  const n = necesidades[sel];

  return (
    <section id="necesidad" className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5">
        <p className="mb-4 font-semibold text-sol">Encuentre su solución</p>
        <h2 className="title max-w-2xl text-azul">
          ¿Qué <span className="text-sol">necesita?</span>
        </h2>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
          <ul className="flex flex-wrap gap-3 lg:flex-col lg:flex-nowrap">
            {necesidades.map((x, i) => {
              const on = i === sel;
              return (
                <li key={x.q}>
                  <button
                    type="button"
                    onClick={() => setSel(i)}
                    onMouseEnter={() => setSel(i)}
                    aria-pressed={on}
                    className={`group relative flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-left font-medium transition-colors duration-300 ${
                      on ? "text-azul-950" : "text-gris hover:text-azul"
                    }`}
                  >
                    {on && (
                      <motion.span
                        layoutId="necesidad-pill"
                        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-sol/25 to-sol-claro/10 ring-1 ring-inset ring-sol/50"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                    <span
                      className={`relative grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold transition-colors duration-300 ${
                        on ? "bg-sol text-azul-950" : "bg-humo text-gris group-hover:bg-sol/20"
                      }`}
                    >
                      0{i + 1}
                    </span>
                    <span className="relative">{x.q}</span>
                    <span className={`relative ml-auto hidden transition-transform duration-300 lg:block ${on ? "translate-x-0 text-sol" : "-translate-x-2 opacity-0"}`}>
                      →
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="relative flex min-h-[24rem] flex-col overflow-hidden rounded-[28px] bg-azul-950 p-8 text-white md:p-10">
            <span aria-hidden className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(255,194,61,.35),transparent_65%)]" />
            <AnimatePresence mode="wait">
              <motion.div
                key={sel}
                className="relative flex flex-1 flex-col"
                initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -16, filter: "blur(6px)" }}
                transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
              >
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sol-claro">La solución</p>
                <h3 className="mt-3 text-3xl font-bold leading-tight md:text-4xl">{n.title}</h3>
                <p className="mt-4 max-w-lg leading-relaxed text-white/75">{n.body}</p>
                <p className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm ring-1 ring-inset ring-white/15">
                  <span className="h-1.5 w-1.5 rounded-full bg-sol-claro" />
                  {n.dato}
                </p>
                <a href={n.cta.href} className="btn-sol mt-8 w-fit lg:mt-auto">
                  {n.cta.label} →
                </a>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
