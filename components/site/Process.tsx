"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { media, process } from "@/lib/content";

gsap.registerPlugin(ScrollTrigger);

export default function Process() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".proc-fill",
        { scaleY: 0 },
        { scaleY: 1, ease: "none", scrollTrigger: { trigger: ".proc-list", start: "top 65%", end: "bottom 65%", scrub: true } },
      );
      gsap.utils.toArray<HTMLElement>(".proc-step").forEach((step) => {
        gsap.from(step, { opacity: 0.25, x: 30, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: step, start: "top 70%" } });
        ScrollTrigger.create({
          trigger: step,
          start: "top 65%",
          onEnter: () => step.classList.add("is-on"),
          onLeaveBack: () => step.classList.remove("is-on"),
        });
      });
      gsap.fromTo(".proc-photo", { yPercent: -8 }, { yPercent: 8, ease: "none", scrollTrigger: { trigger: root.current, scrub: true } });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="proceso" ref={root} className="overflow-x-clip bg-white py-24 md:py-32">
      <div className="mx-auto grid max-w-6xl gap-14 px-5 lg:grid-cols-2 lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="mb-4 font-semibold text-sol">Cómo trabajamos</p>
          <h2 className="title text-azul">
            De tu factura a tu <span className="text-sol">sistema funcionando</span>
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-gris">
            Un solo equipo se encarga de todo el camino. Tú recibes el sistema certificado, legalizado y generando energía.
          </p>
          <div className="relative mt-10 hidden aspect-[4/3] overflow-hidden rounded-[28px] lg:block">
            <Image
              src={`${media.engineerRoof}?w=1200&q=70&auto=format`}
              alt="Ingenieros revisando una instalación solar en cubierta"
              fill
              sizes="40vw"
              className="proc-photo scale-110 object-cover"
            />
          </div>
        </div>

        <ol className="proc-list relative space-y-14 pl-16">
          <span className="absolute bottom-2 left-[22px] top-2 w-0.5 bg-azul/10" aria-hidden />
          <span className="proc-fill absolute bottom-2 left-[22px] top-2 w-0.5 origin-top bg-sol" aria-hidden />
          {process.map((s, i) => (
            <li key={s.title} className="proc-step group relative">
              <span className="absolute -left-16 top-0 grid h-[46px] w-[46px] place-items-center rounded-full border-2 border-azul/15 bg-white text-lg font-bold text-azul/40 transition-all duration-500 group-[.is-on]:border-sol group-[.is-on]:bg-sol group-[.is-on]:text-azul-950 group-[.is-on]:shadow-[0_0_0_8px_rgba(240,165,0,.18)]">
                {i + 1}
              </span>
              <h3 className="pt-2 text-2xl font-bold text-azul">{s.title}</h3>
              <p className="mt-3 max-w-md text-lg leading-relaxed text-gris">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
