"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { solar } from "@/lib/content";

gsap.registerPlugin(ScrollTrigger);

export default function Solutions({ items = solar }: { items?: typeof solar }) {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // Escritorio: recorrido horizontal fijado al scroll
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const t = track.current!;
        const distance = () => t.scrollWidth - window.innerWidth;
        const move = gsap.to(t, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => `+=${distance()}`,
            scrub: 0.6,
            pin: true,
            invalidateOnRefresh: true,
          },
        });
        gsap.to(".sol-progress", {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: () => `+=${distance()}`, scrub: true },
        });
        // Parallax de cada foto dentro de su tarjeta
        gsap.utils.toArray<HTMLElement>(".sol-img").forEach((img) => {
          gsap.fromTo(
            img,
            { xPercent: -8 },
            {
              xPercent: 8,
              ease: "none",
              scrollTrigger: { trigger: img, containerAnimation: move, start: "left right", end: "right left", scrub: true },
            },
          );
        });
      });

      // Celular: cada tarjeta se revela al entrar
      mm.add("(max-width: 1023px) and (prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>(".sol-card").forEach((card) => {
          gsap.from(card, {
            clipPath: "inset(12% 8% 12% 8% round 28px)",
            opacity: 0.4,
            duration: 1.1,
            ease: "expo.out",
            scrollTrigger: { trigger: card, start: "top 85%" },
          });
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="soluciones" ref={root} className="relative overflow-hidden bg-azul-950 text-white">
      <div className="flex min-h-svh flex-col justify-center py-24 lg:py-0">
        <div
          ref={track}
          className="flex flex-col gap-6 px-5 lg:w-max lg:flex-row lg:items-stretch lg:gap-8 lg:pl-[max(1.25rem,calc((100vw-72rem)/2))] lg:pr-[10vw]"
        >
          {/* Introducción */}
          <div className="flex shrink-0 flex-col justify-center lg:w-[34rem] lg:pr-10">
            <p className="mb-4 font-semibold text-sol">Soluciones de energía solar</p>
            <h2 className="title">
              Un sistema para cada necesidad, <span className="text-sol">diseñado con ingeniería</span>
            </h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-white/75">
              Maximizamos tu retorno de inversión con sistemas diseñados para el clima y la infraestructura de cada
              región de Colombia.
            </p>
            <div className="mt-10 hidden h-1 w-64 overflow-hidden rounded-full bg-white/15 lg:block">
              <div className="sol-progress h-full origin-left scale-x-0 bg-sol" />
            </div>
          </div>

          {items.map((s) => (
            <article
              key={s.id}
              id={s.id}
              className="sol-card group relative h-[78svh] min-h-[520px] shrink-0 overflow-hidden rounded-[28px] lg:h-[74vh] lg:w-[min(68vw,60rem)]"
            >
              <div className="sol-img absolute inset-[-2%] lg:inset-y-0 lg:-inset-x-[10%]">
                <Image
                  src={s.image.startsWith("/") ? s.image : `${s.image}?w=1600&q=70&auto=format`}
                  alt={s.title}
                  fill
                  sizes="(min-width: 1024px) 70vw, 100vw"
                  unoptimized={s.image.endsWith(".svg")}
                  loading="eager"
                  className="object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-azul-950 via-azul-950/40 to-transparent" />
              <div className="relative flex h-full flex-col justify-end p-7 md:p-10">
                <span className="glass mb-auto self-start rounded-full px-4 py-1.5 text-sm font-medium">{s.tag}</span>
                <h3 className="text-[clamp(2rem,4vw,3.4rem)] font-bold leading-tight">{s.title}</h3>
                <p className="mt-3 max-w-xl text-white/85 md:text-lg">{s.body}</p>
                <ul className="mt-6 grid gap-2 text-sm md:grid-cols-3 md:gap-4">
                  {s.points.map((p) => (
                    <li key={p} className="glass flex items-center gap-2 rounded-2xl px-4 py-3">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f0a500" strokeWidth="2.5" aria-hidden>
                        <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
