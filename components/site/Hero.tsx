"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { media } from "@/lib/content";
import { site } from "@/lib/site";

gsap.registerPlugin(ScrollTrigger);

const line1 = ["Haz", "del", "sol", "tu"];
const line2 = ["mejor", "inversión"];

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = video.current;
    if (v && window.matchMedia("(max-width: 767px)").matches) v.src = media.heroVideoMobile;
    v?.play().catch(() => {});

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      // Entrada: palabras que suben desde una máscara
      gsap.from(".hero-word", {
        yPercent: 110,
        duration: 1.1,
        ease: "expo.out",
        stagger: 0.07,
        delay: 0.2,
      });
      gsap.from(".hero-fade", { opacity: 0, y: 30, duration: 1, ease: "power3.out", stagger: 0.12, delay: 0.7 });
      if (reduced) return;

      // Al bajar: el video se convierte en una tarjeta redondeada (estilo Apple)
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: "top top", end: "+=70%", scrub: 0.8, pin: true },
      });
      tl.to(frame.current, { clipPath: "inset(7% 4% 7% 4% round 36px)", ease: "none" }, 0)
        .to(v, { scale: 1.15, ease: "none" }, 0)
        .to(content.current, { yPercent: -25, opacity: 0, ease: "none" }, 0);
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="inicio" ref={root} className="relative h-svh overflow-hidden bg-white">
      <div
        ref={frame}
        className="absolute inset-0 overflow-hidden bg-azul-950"
        style={{ clipPath: "inset(0% 0% 0% 0% round 0px)" }}
      >
        <video
          ref={video}
          className="h-full w-full object-cover"
          src={media.heroVideo}
          poster={`${media.heroPoster}?w=1600&q=70&auto=format`}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-b from-azul-950/70 via-azul-950/35 to-azul-950/80" />
      </div>

      <div ref={content} className="relative z-10 mx-auto flex h-full max-w-6xl flex-col items-center justify-center px-5 text-center text-white">
        <p className="hero-fade mb-6 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-sm backdrop-blur-md">
          Energía solar e ingeniería eléctrica en toda Colombia
        </p>
        <h1 className="text-[clamp(2.6rem,7.5vw,6rem)] font-bold leading-[1.02] tracking-tight">
          <span className="block">
            {line1.map((w) => (
              <span key={w} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                <span className="hero-word mr-[0.25em] inline-block">{w}</span>
              </span>
            ))}
          </span>
          <span className="block">
            {line2.map((w) => (
              <span key={w} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                <span className="hero-word mr-[0.25em] inline-block bg-gradient-to-r from-sol to-sol-claro bg-clip-text text-transparent">
                  {w}
                </span>
              </span>
            ))}
          </span>
        </h1>
        <p className="hero-fade mt-7 max-w-2xl text-lg leading-relaxed text-white/85 md:text-xl">
          Diseñamos sistemas solares on-grid, off-grid, híbridos y BESS con análisis técnico-financiero, legalización y
          certificación RETIE.
        </p>
        <div className="hero-fade mt-10 flex flex-wrap justify-center gap-4">
          <a href="#calculadora" className="btn-sol">
            Calcular mi ahorro
          </a>
          <a href={`${site.whatsapp}un%20sistema%20solar`} target="_blank" rel="noopener noreferrer" className="btn-ghost">
            Hablar con un ingeniero
          </a>
        </div>
      </div>

      <a
        href="#soluciones"
        aria-label="Bajar a soluciones"
        className="hero-fade absolute bottom-8 left-1/2 z-10 grid h-12 w-8 -translate-x-1/2 justify-center rounded-full border-2 border-white/60 pt-2"
      >
        <span className="h-2.5 w-1 animate-bounce rounded-full bg-white" />
      </a>
    </section>
  );
}
