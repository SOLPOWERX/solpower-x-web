"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { brands, media, norms, values } from "@/lib/content";

gsap.registerPlugin(ScrollTrigger);

export default function Trust() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(".why-bg", { yPercent: -12 }, { yPercent: 12, ease: "none", scrollTrigger: { trigger: ".why", scrub: true } });
      gsap.from(".why-card", {
        y: 80,
        opacity: 0,
        duration: 1,
        ease: "expo.out",
        stagger: 0.12,
        scrollTrigger: { trigger: ".why-grid", start: "top 80%" },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="tecnologias" className="bg-white">
      {/* Marcas y normas */}
      <div className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-5 text-center">
          <p className="mb-4 font-semibold text-sol">Tecnologías y normativas</p>
          <h2 className="title mx-auto max-w-3xl text-azul">
            Fabricantes Tier 1 y <span className="text-sol">normas que cumplimos</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-gris">
            Trabajamos con fabricantes líderes y herramientas de ingeniería reconocidas en el mundo, con instalaciones
            que cumplen el Reglamento Técnico de Instalaciones Eléctricas.
          </p>
        </div>
        <div className="relative mt-14 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
          <ul className="marquee flex w-max gap-4">
            {[...brands, ...brands].map((b, i) => (
              <li
                key={i}
                aria-hidden={i >= brands.length}
                className="whitespace-nowrap rounded-full border border-azul/10 bg-humo px-8 py-4 text-xl font-semibold text-azul/70 transition-colors hover:bg-azul hover:text-white"
              >
                {b}
              </li>
            ))}
          </ul>
        </div>
        <dl className="mx-auto mt-12 grid max-w-6xl grid-cols-2 gap-4 px-5 md:grid-cols-4">
          {norms.map((n) => (
            <div key={n.name} className="rounded-2xl border border-azul/10 p-5 text-center">
              <dt className="text-xl font-bold text-azul">{n.name}</dt>
              <dd className="mt-1 text-sm text-gris">{n.body}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Por qué elegirnos */}
      <div className="why relative overflow-hidden py-24 text-white md:py-36">
        <div className="why-bg absolute inset-[-15%_0]">
          <Image src={`${media.aerialRows}?w=2000&q=70&auto=format`} alt="" fill sizes="100vw" className="object-cover" />
        </div>
        <div className="absolute inset-0 bg-azul-950/65" />
        <div className="relative mx-auto max-w-6xl px-5">
          <h2 className="title max-w-2xl">
            Ingeniería de precisión, <span className="text-sol">¿por qué elegirnos?</span>
          </h2>
          <p className="mt-5 max-w-xl text-lg text-white/80">
            No solo instalamos paneles: diseñamos sistemas de energía que se ajustan a tu consumo y cumplen la norma.
          </p>
          <div className="why-grid mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <article key={v.title} className="why-card glass rounded-3xl p-7 transition-colors hover:bg-white/20">
                <span className="mb-6 block h-1 w-10 rounded-full bg-sol" />
                <h3 className="text-xl font-bold">{v.title}</h3>
                <p className="mt-3 leading-relaxed text-white/80">{v.body}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
