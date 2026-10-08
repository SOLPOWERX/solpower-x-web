"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { site } from "@/lib/site";
import { norms, clients } from "@/lib/content";
import { ingenieriaSolar, serviciosElectricos, waIngenieria, waInstaladores } from "@/lib/ingenieria";
import HeaderNuevo from "./HeaderNuevo";
import HeroPagina from "./HeroPagina";
import { GD, GI, type Etapa } from "./EtapasEscena";

const EscenaIngenieria = dynamic(() => import("./escena/EscenaIngenieria"), { ssr: false });

const etapas: Etapa[] = [
  {
    a: 0.15, b: 0.36, n: "01", kicker: "Diseño", title: "Todo empieza en el plano",
    body: "Planos, memorias de cálculo RETIE y simulación PVsyst antes de construir.",
    pos: `inset-x-5 bottom-12 md:inset-x-auto md:bottom-[12%] md:w-[23rem] ${GI}`,
  },
  {
    a: 0.4, b: 0.58, n: "02", kicker: "Subestaciones", title: "Tipo poste, pedestal y patio",
    body: "Transformador, protecciones y malla de puesta a tierra calculada con IEEE 80.",
    pos: `inset-x-5 top-24 md:inset-x-auto md:top-[15%] md:w-[22rem] ${GI}`,
  },
  {
    a: 0.61, b: 0.78, n: "03", kicker: "Redes", title: "Media y baja tensión",
    body: "Diseño y construcción del poste al tablero, con el trámite ante el operador de red.",
    pos: `inset-x-5 bottom-12 md:inset-x-auto md:bottom-auto md:top-1/2 md:w-[22rem] md:-translate-y-1/2 ${GD}`,
    caja: true,
  },
  {
    a: 0.82, b: 1.1, n: "04", kicker: "Calidad de energía y RETIE", title: "Energía limpia y certificada",
    body: "Medimos armónicos y factor de potencia, corregimos y certificamos la instalación.",
    pos: `inset-x-5 top-24 md:inset-x-auto md:top-[15%] md:w-[21rem] ${GI}`,
    caja: true,
  },
];

const iconosSolar = [
  <path key="0" d="M4 19h16M6 19l2-9h8l2 9M9 10l-1-5h8l-1 5M12 5V3" />,
  <path key="1" d="M5 3h10l4 4v14H5V3Zm10 0v4h4M8 12h8M8 16h5" />,
  <path key="2" d="M4 7h16v12H4V7Zm4-4h8v4H8V3Zm1 10 2 2 4-4" />,
  <path key="3" d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M9 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 0h4m-2-2v4" />,
];

function Servicio({ s, i }: { s: (typeof serviciosElectricos)[number]; i: number }) {
  const [on, setOn] = useState(i === 0);
  return (
    <li className="border-b border-white/10">
      <button type="button" onClick={() => setOn(!on)} aria-expanded={on} className="group flex w-full items-center gap-5 py-6 text-left">
        <span className="text-sm font-semibold text-sol">0{i + 1}</span>
        <span className="flex-1">
          <span className="block text-xl font-semibold transition-colors group-hover:text-sol-claro md:text-2xl">{s.title}</span>
          <span className="mt-1 block text-white/60">{s.body}</span>
        </span>
        <motion.span
          animate={{ rotate: on ? 45 : 0 }}
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${on ? "bg-sol text-azul-950" : "bg-white/10 text-white"}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden>
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {on && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
            className="grid gap-3 overflow-hidden pb-7 pl-9 sm:grid-cols-2"
          >
            {s.incluye.map((x) => (
              <li key={x} className="flex items-center gap-3 rounded-xl bg-white/[.05] px-4 py-3 text-sm text-white/85 ring-1 ring-inset ring-white/10">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sol-claro shadow-[0_0_8px_rgba(255,194,61,.8)]" />
                {x}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </li>
  );
}

const revela = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-10%" },
};

export default function IngenieriaPagina() {
  return (
    <>
      <HeaderNuevo />
      <main>
        <HeroPagina
          Escena={EscenaIngenieria}
          etapas={etapas}
          kicker="Diseño, construcción y certificación · Toda Colombia"
          lineas={[["Ingeniería", "eléctrica"], ["y", "solar"]]}
          pista="Baje para ver el plano convertirse en obra"
          botones={
            <>
              <a href={waIngenieria} target="_blank" rel="noopener noreferrer" className="btn-sol shine">
                Hablar con un ingeniero
              </a>
              <a href="#servicios" className="btn-ghost">
                Ver servicios
              </a>
            </>
          }
        />

        {/* Ingeniería solar */}
        <section id="solar" className="scroll-mt-24 bg-white py-24 md:py-32">
          <div className="mx-auto max-w-7xl px-5">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <p className="mb-4 font-semibold text-sol">Ingeniería solar · Para clientes e instaladores</p>
                <h2 className="title max-w-2xl text-azul">
                  Todo lo técnico de su proyecto, <span className="text-sol">firmado</span>
                </h2>
              </div>
              <p className="max-w-sm text-gris">Le entregamos la ingeniería lista para construir, legalizar y certificar.</p>
            </div>
            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {ingenieriaSolar.map((s, i) => (
                <motion.article
                  key={s.title}
                  {...revela}
                  transition={{ delay: i * 0.1, duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
                  className="group relative overflow-hidden rounded-3xl bg-humo p-7 transition-colors duration-300 hover:bg-azul-950 hover:text-white"
                >
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-azul shadow-sm transition-colors duration-300 group-hover:bg-sol group-hover:text-azul-950">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      {iconosSolar[i]}
                    </svg>
                  </span>
                  <h3 className="mt-8 text-xl font-semibold text-azul transition-colors group-hover:text-white">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gris transition-colors group-hover:text-white/75">{s.body}</p>
                </motion.article>
              ))}
            </div>

            {/* Para instaladores */}
            <motion.div
              {...revela}
              transition={{ duration: 0.8 }}
              className="relative mt-10 overflow-hidden rounded-[28px] bg-azul-950 p-8 text-white md:flex md:items-center md:justify-between md:gap-10 md:p-12"
            >
              <span aria-hidden className="absolute -left-20 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(255,194,61,.3),transparent_65%)]" />
              <div className="relative">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sol-claro">¿Es instalador?</p>
                <h3 className="mt-3 text-3xl font-bold md:text-4xl">Usted instala, nosotros firmamos</h3>
                <p className="mt-3 max-w-xl text-white/70">
                  Simulación, planos, memorias RETIE y legalización para sus proyectos. Trabajamos con empresas como{" "}
                  {clients.map((c) => c.name).join(" y ")}.
                </p>
              </div>
              <a href={waInstaladores} target="_blank" rel="noopener noreferrer" className="btn-sol shine relative mt-6 shrink-0 md:mt-0">
                Trabajar con nosotros
              </a>
            </motion.div>
          </div>
        </section>

        {/* Otros servicios de ingeniería eléctrica */}
        <section id="servicios" className="scroll-mt-24 bg-azul-950 py-24 text-white md:py-32">
          <div id="electrica" className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-[1fr_1.5fr]">
            <div>
              <p className="mb-4 font-semibold text-sol">Servicios de ingeniería eléctrica</p>
              <h2 className="title">
                Del poste <span className="text-sol">al tablero</span>
              </h2>
              <p className="mt-5 max-w-sm text-white/65">Toque cada servicio para ver lo que incluye.</p>
            </div>
            <ul className="border-t border-white/10">
              {serviciosElectricos.map((s, i) => (
                <Servicio key={s.title} s={s} i={i} />
              ))}
            </ul>
          </div>
        </section>

        {/* Normas */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-5">
            <p className="mb-8 text-center font-semibold text-sol">Trabajamos bajo norma</p>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {norms.map((n, i) => (
                <motion.li
                  key={n.name}
                  {...revela}
                  transition={{ delay: i * 0.08, duration: 0.7 }}
                  className="rounded-2xl border border-azul/10 p-6 text-center"
                >
                  <p className="text-2xl font-bold text-azul">{n.name}</p>
                  <p className="mt-1 text-sm text-gris">{n.body}</p>
                </motion.li>
              ))}
            </ul>
          </div>
        </section>

        {/* Cierre */}
        <section className="relative overflow-hidden bg-azul-950 py-28 text-white md:py-36">
          <div aria-hidden className="absolute inset-0 bg-[linear-gradient(rgba(127,216,255,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(127,216,255,.07)_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className="relative mx-auto max-w-3xl px-5 text-center">
            <h2 className="title">
              Cuéntenos su proyecto y <span className="text-sol">le responde un ingeniero</span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-white/80">Subestación, red, instalación, certificación o calidad de energía.</p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <a href={waIngenieria} target="_blank" rel="noopener noreferrer" className="btn-sol shine">
                Escribir por WhatsApp
              </a>
              <a href={`tel:${site.phoneRaw}`} className="btn-ghost">
                Llamar al {site.phone}
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-azul-950 py-8 text-center text-sm text-white/50">
        © {new Date().getFullYear()} {site.name} ·{" "}
        <a href={site.inicio} className="underline-offset-4 hover:text-white hover:underline">
          Ir al inicio
        </a>
      </footer>
    </>
  );
}
