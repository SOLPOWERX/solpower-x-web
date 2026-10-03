"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { stats } from "@/lib/content";

gsap.registerPlugin(ScrollTrigger);

const statement =
  "Diseñamos sistemas solares que se pagan solos. Estudio de consumo, simulación PVsyst, legalización y certificación RETIE, todo con un solo equipo de ingeniería.";

export default function Manifesto() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      // Contadores
      gsap.utils.toArray<HTMLElement>(".stat-num").forEach((el) => {
        const end = Number(el.dataset.value);
        const obj = { v: reduced ? end : 0 };
        el.textContent = String(obj.v);
        if (reduced) return;
        gsap.to(obj, {
          v: end,
          duration: 2,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
          onUpdate: () => (el.textContent = String(Math.round(obj.v))),
        });
      });
      if (reduced) return;
      // Palabras que se iluminan con el scroll
      gsap.fromTo(
        ".m-word",
        { opacity: 0.15 },
        {
          opacity: 1,
          stagger: 0.05,
          ease: "none",
          scrollTrigger: { trigger: ".m-text", start: "top 80%", end: "bottom 45%", scrub: true },
        },
      );
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="bg-white pb-24 pt-10 md:pb-36">
      <div className="mx-auto max-w-6xl px-5">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-10 border-b border-azul/10 pb-16 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label}>
              <dt className="sr-only">{s.label}</dt>
              <dd>
                <p className="text-[clamp(2rem,4.5vw,3.4rem)] font-bold leading-none text-azul">
                  <span className="text-[0.55em] font-semibold text-gris">{s.prefix}</span>
                  <span className="stat-num" data-value={s.value}>
                    {s.value}
                  </span>
                  <span className="text-sol">{s.suffix}</span>
                </p>
                <p className="mt-3 max-w-[14rem] text-sm text-gris">{s.label}</p>
              </dd>
            </div>
          ))}
        </dl>

        <p className="m-text mt-20 text-[clamp(1.6rem,3.6vw,3rem)] font-semibold leading-[1.25] tracking-tight text-azul md:mt-28">
          {statement.split(" ").map((w, i) => (
            <span key={i} className="m-word">
              {w}{" "}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
