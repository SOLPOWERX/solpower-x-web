"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Logo from "@/components/site/Logo";
import { site } from "@/lib/site";
import { empresasMedia, faqsEmpresas, ganancias, pasos, sectores, waEmpresas } from "@/lib/empresas";

gsap.registerPlugin(ScrollTrigger);

const titulo = ["Energía", "solar", "para"];
const tituloSol = ["su", "empresa"];

function WaIcon({ size = 22 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden>
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35zM12.04 21.5h-.01a9.45 9.45 0 0 1-4.82-1.32l-.35-.21-3.58.94.96-3.49-.23-.36a9.43 9.43 0 0 1-1.45-5.03c0-5.22 4.25-9.47 9.48-9.47 2.53 0 4.91.99 6.7 2.78a9.41 9.41 0 0 1 2.77 6.7c0 5.22-4.25 9.46-9.47 9.46zm8.06-17.53A11.33 11.33 0 0 0 12.04.63C5.76.63.65 5.74.65 12.02c0 2 .52 3.96 1.52 5.69L.55 23.6l6.04-1.58a11.36 11.36 0 0 0 5.44 1.39h.01c6.28 0 11.39-5.11 11.39-11.39 0-3.04-1.18-5.9-3.33-8.05z" />
    </svg>
  );
}

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <ul className="space-y-3">
      {faqsEmpresas.map((f, i) => {
        const on = open === i;
        return (
          <li key={f.q} className={`rounded-2xl bg-white transition-shadow ${on ? "shadow-[0_20px_40px_-25px_rgba(13,43,94,.45)]" : ""}`}>
            <button
              type="button"
              onClick={() => setOpen(on ? null : i)}
              aria-expanded={on}
              className="flex w-full items-center justify-between gap-6 p-5 text-left text-base font-semibold text-azul md:p-6 md:text-lg"
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
                  <p className="px-5 pb-6 leading-relaxed text-gris md:px-6">{f.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}

export default function Landing() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      gsap.from(".emp-word", { yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.07, delay: 0.15 });
      gsap.from(".emp-fade", { opacity: 0, y: 28, duration: 1, ease: "power3.out", stagger: 0.12, delay: 0.6 });
      if (reduced) return;

      // Foto del héroe: se acerca y se oscurece al bajar
      gsap.to(".emp-hero-img", {
        scale: 1.18,
        ease: "none",
        scrollTrigger: { trigger: ".emp-hero", start: "top top", end: "bottom top", scrub: true },
      });

      gsap.utils.toArray<HTMLElement>(".emp-reveal").forEach((el) => {
        gsap.from(el.children, {
          opacity: 0,
          y: 50,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: { trigger: el, start: "top 80%" },
        });
      });

      // Línea de energía que se llena con los pasos
      gsap.fromTo(
        ".emp-line",
        { scaleX: 0 },
        { scaleX: 1, ease: "none", scrollTrigger: { trigger: ".emp-pasos", start: "top 75%", end: "bottom 60%", scrub: true } },
      );

      gsap.fromTo(
        ".emp-cierre-img",
        { yPercent: -10 },
        { yPercent: 10, ease: "none", scrollTrigger: { trigger: ".emp-cierre", scrub: true } },
      );
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={root} className="overflow-x-clip">
      {/* Barra simple: logo + contacto, sin menú que distraiga */}
      <header className="fixed inset-x-0 top-3 z-40 px-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-full bg-azul-950/80 py-2 pl-4 pr-2 shadow-[0_10px_30px_-15px_rgba(4,15,38,.6)] backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <a
              href={site.inicio}
              aria-label="Volver al inicio"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-sol hover:text-azul-950"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
                <path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a href={site.inicio} aria-label="SOLPOWER X, inicio">
              <Logo light size={34} />
            </a>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`tel:${site.phoneRaw}`}
              className="hidden rounded-full px-4 py-2 text-sm font-medium text-white/85 transition-colors hover:text-white sm:inline-flex"
            >
              {site.phone}
            </a>
            <a href={waEmpresas} target="_blank" rel="noopener noreferrer" className="btn-sol !px-4 !py-2 text-sm">
              <WaIcon size={18} />
              WhatsApp
            </a>
          </div>
        </div>
      </header>

      <main>
        {/* Héroe */}
        <section className="emp-hero relative flex min-h-svh items-center overflow-hidden bg-azul-950 pb-16 pt-28">
          <Image
            src={`${empresasMedia.hero}&w=1920`}
            alt="Techo industrial con paneles solares"
            fill
            priority
            unoptimized
            className="emp-hero-img object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-azul-950/60 via-azul-950/80 to-azul-950/95 md:bg-gradient-to-r md:from-azul-950/95 md:via-azul-950/75 md:to-azul-950/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-azul-950/90 via-transparent to-transparent" />

          <div className="relative z-10 mx-auto w-full max-w-6xl px-5 text-white">
            <p className="emp-fade mb-6 inline-block rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-sm backdrop-blur-md">
              Industria, comercio y servicios · Bogotá y la Sabana
            </p>
            <h1 className="max-w-4xl text-[clamp(2.5rem,7vw,5.5rem)] font-bold leading-[1.02] tracking-tight">
              <span className="block">
                {titulo.map((w) => (
                  <span key={w} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                    <span className="emp-word mr-[0.25em] inline-block">{w}</span>
                  </span>
                ))}
              </span>
              <span className="block">
                {tituloSol.map((w) => (
                  <span key={w} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                    <span className="emp-word mr-[0.25em] inline-block bg-gradient-to-r from-sol to-sol-claro bg-clip-text text-transparent">
                      {w}
                    </span>
                  </span>
                ))}
              </span>
            </h1>
            <p className="emp-fade mt-7 max-w-2xl text-lg leading-relaxed text-white/85 md:text-xl">
              Sistemas solares medianos y grandes, hasta 1 MW, sobre el techo de su bodega, planta o edificio. Diseño,
              instalación, trámite con el operador de red y certificación RETIE, llave en mano.
            </p>
            <div className="emp-fade mt-10 flex flex-wrap gap-4">
              <a href={waEmpresas} target="_blank" rel="noopener noreferrer" className="btn-sol">
                <WaIcon />
                Envíe su factura por WhatsApp
              </a>
              <a href="#beneficios" className="btn-ghost">
                Ver beneficios
              </a>
            </div>
            <ul className="emp-fade mt-12 flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/80">
              {["Estudio de ahorro sin costo", "Beneficios Ley 1715", "Certificación RETIE"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-sol text-azul-950">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" aria-hidden>
                      <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Para quién */}
        <section className="bg-white py-24 md:py-32">
          <div className="mx-auto max-w-6xl px-5">
            <p className="mb-4 font-semibold text-sol">Para quién</p>
            <h2 className="title max-w-3xl text-azul">
              Empresas que consumen <span className="text-sol">de día</span>
            </h2>
            <p className="mt-5 max-w-2xl text-lg text-gris">
              El sol produce justo en las horas en que su empresa más energía usa. Ahí está el ahorro.
            </p>
            <div className="emp-reveal mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {sectores.map((s) => (
                <article key={s.title} className="group relative h-80 overflow-hidden rounded-3xl bg-azul-950 text-white">
                  <Image
                    src={s.image.includes("pexels") ? `${s.image}&w=800` : `${s.image}?w=800&q=70&auto=format`}
                    alt={s.title}
                    fill
                    unoptimized
                    className="object-cover opacity-80 transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-azul-950 via-azul-950/40 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <h3 className="text-xl font-semibold">{s.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/80">{s.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Lo que gana */}
        <section id="beneficios" className="relative overflow-hidden bg-azul-950 py-24 text-white md:py-32">
          <div className="pointer-events-none absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle,rgba(240,165,0,.28)_0%,transparent_65%)]" />
          <div className="relative mx-auto max-w-6xl px-5">
            <p className="mb-4 font-semibold text-sol">Lo que gana su empresa</p>
            <h2 className="title max-w-3xl">
              Ahorro mensual y <span className="text-sol">beneficios tributarios</span>
            </h2>
            <div className="emp-reveal mt-14 grid gap-5 md:grid-cols-2">
              {ganancias.map((g) => (
                <article
                  key={g.title}
                  className="glass rounded-3xl p-7 transition-colors duration-300 hover:border-sol/60 md:p-9"
                >
                  <p className="text-sm font-semibold uppercase tracking-wider text-sol-claro">{g.kicker}</p>
                  <h3 className="mt-3 text-2xl font-semibold">{g.title}</h3>
                  <p className="mt-3 leading-relaxed text-white/75">{g.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Proceso */}
        <section className="bg-white py-24 md:py-32">
          <div className="mx-auto max-w-6xl px-5">
            <p className="mb-4 font-semibold text-sol">Así trabajamos</p>
            <h2 className="title max-w-3xl text-azul">
              De la factura al sistema <span className="text-sol">funcionando</span>
            </h2>
            <div className="emp-pasos relative mt-16">
              <div className="absolute left-0 right-0 top-6 hidden h-0.5 bg-humo lg:block">
                <div className="emp-line h-full origin-left bg-gradient-to-r from-sol to-sol-claro" />
              </div>
              <ol className="emp-reveal grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                {pasos.map((p, i) => (
                  <li key={p.title} className="relative">
                    <span className="relative z-10 grid h-12 w-12 place-items-center rounded-full bg-azul text-lg font-bold text-sol-claro ring-8 ring-white">
                      {i + 1}
                    </span>
                    <h3 className="mt-5 text-xl font-semibold text-azul">{p.title}</h3>
                    <p className="mt-2 leading-relaxed text-gris">{p.body}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* Preguntas */}
        <section className="bg-humo py-24 md:py-32">
          <div className="mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-[1fr_1.4fr]">
            <div>
              <p className="mb-4 font-semibold text-sol">Preguntas frecuentes</p>
              <h2 className="title text-azul">
                Lo que más <span className="text-sol">preguntan</span> las empresas
              </h2>
              <p className="mt-5 max-w-sm text-gris">¿Tiene otra duda? Escríbanos y le responde un ingeniero.</p>
            </div>
            <Faq />
          </div>
        </section>

        {/* Cierre */}
        <section className="emp-cierre relative overflow-hidden bg-azul-950 py-28 text-white md:py-36">
          <Image
            src={`${empresasMedia.cierre}&w=1920`}
            alt=""
            fill
            unoptimized
            className="emp-cierre-img scale-125 object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-azul-950/80 to-azul-950/95" />
          <div className="relative mx-auto max-w-3xl px-5 text-center">
            <h2 className="title">
              Mándenos la factura de energía <span className="text-sol">de su empresa</span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-white/80">
              Le decimos cuánto puede ahorrar y en cuánto tiempo se paga el sistema. Sin costo y sin compromiso.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <a href={waEmpresas} target="_blank" rel="noopener noreferrer" className="btn-sol">
                <WaIcon />
                Enviar por WhatsApp
              </a>
              <a href={`tel:${site.phoneRaw}`} className="btn-ghost">
                Llamar al {site.phone}
              </a>
            </div>
            <p className="mt-8 text-sm text-white/60">{site.name} · Energía solar e ingeniería eléctrica</p>
          </div>
        </section>
      </main>

      <footer className="bg-azul-950 py-8 text-center text-sm text-white/50">
        © {new Date().getFullYear()} {site.name} ·{" "}
        <a href={site.inicio} className="underline-offset-4 hover:text-white hover:underline">
          solpowerx.com
        </a>
      </footer>

      <a
        href={waEmpresas}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Escribir por WhatsApp"
        className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105"
      >
        <WaIcon size={28} />
      </a>
    </div>
  );
}
