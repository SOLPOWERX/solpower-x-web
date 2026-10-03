"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { faqs } from "@/lib/content";

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <section id="preguntas" className="bg-humo py-24 md:py-32">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <p className="mb-4 font-semibold text-sol">Preguntas frecuentes</p>
          <h2 className="title text-azul">
            Resolvemos <span className="text-sol">tus dudas</span>
          </h2>
          <p className="mt-5 max-w-sm text-gris">Si tu pregunta no está aquí, escríbenos y te respondemos con gusto.</p>
        </div>
        <ul className="space-y-3">
          {faqs.map((f, i) => {
            const on = open === i;
            return (
              <li key={f.q} className={`rounded-2xl bg-white transition-shadow ${on ? "shadow-[0_20px_40px_-25px_rgba(13,43,94,.45)]" : ""}`}>
                <button
                  type="button"
                  onClick={() => setOpen(on ? null : i)}
                  aria-expanded={on}
                  className="flex w-full items-center justify-between gap-6 p-6 text-left text-lg font-semibold text-azul"
                >
                  {f.q}
                  <motion.span
                    animate={{ rotate: on ? 45 : 0 }}
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${on ? "bg-sol text-azul-950" : "bg-humo text-azul"}`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden>
                      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                    </svg>
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {on && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-6 leading-relaxed text-gris">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
