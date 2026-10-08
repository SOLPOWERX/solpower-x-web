"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { site } from "@/lib/site";
import { faqsEmpresas, ganancias, pasos, sectores, waEmpresas } from "@/lib/empresas";
import HeaderNuevo from "./HeaderNuevo";
import { EtapaEscena, GD, GI, type Etapa } from "./EtapasEscena";

const EscenaEmpresa = dynamic(() => import("./escena/EscenaEmpresa"), { ssr: false });

const c01 = (v: number) => Math.min(1, Math.max(0, v));

const etapas: Etapa[] = [
  {
    a: 0.16, b: 0.36, n: "01", kicker: "Instalación", title: "Su techo ya puede producir energía",
    body: "Sistemas de hasta 1 MW sobre bodegas, plantas y edificios.",
    pos: `inset-x-5 bottom-12 md:inset-x-auto md:bottom-[12%] md:w-[24rem] ${GI}`,
  },
  {
    a: 0.4, b: 0.57, n: "02", kicker: "Ahorro", title: "Ahorro desde el primer mes",
    body: "La energía del techo baja a sus máquinas y lo que sobra se reconoce en su factura (CREG 174). El ahorro depende de su consumo.",
    cifra: { valor: "90 %", texto: "menos en su factura, hasta" },
    pos: `inset-x-5 top-24 md:inset-x-auto md:top-[15%] md:w-[22rem] ${GI}`,
  },
  {
    a: 0.62, b: 0.79, n: "03", kicker: "Ley 1715", title: "Deduzca la mitad de su inversión",
    body: "Deducción de renta, equipos sin IVA ni aranceles y depreciación acelerada. Le acompañamos en el trámite.",
    cifra: { valor: "50 %", texto: "de la inversión" },
    pos: `inset-x-5 bottom-12 md:inset-x-auto md:bottom-auto md:top-1/2 md:w-[23rem] md:-translate-y-1/2 ${GD}`,
    caja: true,
  },
  {
    a: 0.84, b: 1.1, n: "04", kicker: "Respaldo", title: "Si se va la luz, su empresa sigue",
    body: "Baterías que mantienen funcionando sus cargas críticas.",
    pos: `inset-x-5 top-24 md:inset-x-auto md:top-[15%] md:w-[20rem] ${GI}`,
    caja: true,
  },
];

function WaIcon({ size = 20 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden>
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35zM12.04 21.5h-.01a9.45 9.45 0 0 1-4.82-1.32l-.35-.21-3.58.94.96-3.49-.23-.36a9.43 9.43 0 0 1-1.45-5.03c0-5.22 4.25-9.47 9.48-9.47 2.53 0 4.91.99 6.7 2.78a9.41 9.41 0 0 1 2.77 6.7c0 5.22-4.25 9.46-9.47 9.46zm8.06-17.53A11.33 11.33 0 0 0 12.04.63C5.76.63.65 5.74.65 12.02c0 2 .52 3.96 1.52 5.69L.55 23.6l6.04-1.58a11.36 11.36 0 0 0 5.44 1.39h.01c6.28 0 11.39-5.11 11.39-11.39 0-3.04-1.18-5.9-3.33-8.05z" />
    </svg>
  );
}

/** Íconos dibujados para cada sector (sin fotos). */
const iconos = [
  // Industria y bodegas
  <path key="0" d="M3 21V10l5 3V10l5 3V7l8 4v10H3Zm4-4h2m3 0h2m3 0h2" />,
  // Comercio
  <path key="1" d="M4 10h16l-1.5-5h-13L4 10Zm0 0v10h16V10M9 20v-5h6v5M4 10a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0" />,
  // Hoteles, clínicas y colegios
  <path key="2" d="M4 21V5h10v16M14 9h6v12M7 9h4M7 13h4M7 17h4M17 13h0M17 17h0M9 3v2" />,
  // Agroindustria
  <path key="3" d="M3 20h18M6 20v-6h5l2 3h4l2 3M8 14V9h4l1 5M17 17a2 2 0 1 0 0 .1M7 20a2 2 0 1 0 0 .1" />,
];

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

function HeroEmpresa() {
  const root = useRef<HTMLElement>(null);
  const raton = useRef({ x: 0, y: 0 });
  const [movil, setMovil] = useState(false);
  const { scrollYProgress: p } = useScroll({ target: root, offset: ["start start", "end end"] });
  const tituloO = useTransform(p, (v) => 1 - c01((v - 0.07) / 0.06));
  const tituloY = useTransform(p, (v) => -c01(v / 0.13) * 80);
  const barra = useTransform(p, (v) => c01(v));

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const on = () => setMovil(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  const entra = (delay: number) => ({
    initial: { opacity: 0, y: 30, filter: "blur(8px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: { delay, duration: 1, ease: [0.2, 0.8, 0.2, 1] as const },
  });

  return (
    <section
      ref={root}
      className="relative h-[520vh] bg-azul-950"
      onMouseMove={(e) => {
        raton.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
        raton.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
      }}
    >
      <div className="sticky top-0 h-svh overflow-hidden text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,#5a2f1c_0%,#0b1733_55%,#040f26_100%)]" />
        <div className="absolute inset-0">
          <EscenaEmpresa progress={p} raton={raton} movil={movil} />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-azul-950/55 via-transparent to-azul-950/40" />

        {/* Título y botones: visibles desde el primer instante (página de anuncios) */}
        <motion.div
          className="absolute inset-x-0 top-[20%] mx-auto max-w-7xl px-5 text-center md:top-1/2 md:-translate-y-1/2 md:text-left"
          style={{ opacity: tituloO, y: tituloY }}
        >
          <motion.p
            {...entra(0.1)}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs backdrop-blur-md md:text-sm"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sol-claro" />
            Industria, comercio y servicios · Bogotá y toda Colombia
          </motion.p>
          <h1 className="text-[clamp(2.6rem,7vw,6rem)] font-bold leading-[1.02] tracking-tight drop-shadow-[0_6px_30px_rgba(4,15,38,.5)]">
            {[["Energía", "solar", "para"], ["su", "empresa"]].map((line, l) => (
              <span key={l} className="block">
                {line.map((w, i) => (
                  <span key={w} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                    <motion.span
                      className={`mr-[0.25em] inline-block ${l ? "bg-gradient-to-r from-sol to-sol-claro bg-clip-text text-transparent" : ""}`}
                      initial={{ y: "110%" }}
                      animate={{ y: 0 }}
                      transition={{ delay: 0.2 + (l * 3 + i) * 0.08, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {w}
                    </motion.span>
                  </span>
                ))}
              </span>
            ))}
          </h1>
          <motion.div {...entra(0.75)} className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center md:justify-start">
            <a href={waEmpresas} target="_blank" rel="noopener noreferrer" className="btn-sol shine">
              <WaIcon />
              Envíe su factura por WhatsApp
            </a>
            <a href="#beneficios" className="btn-ghost">
              Ver beneficios
            </a>
          </motion.div>
        </motion.div>

        {etapas.map((e) => (
          <EtapaEscena key={e.n} e={e} p={p} />
        ))}

        <div className="absolute inset-x-0 bottom-0 h-[2px] bg-white/10">
          <motion.span className="block h-full origin-left bg-gradient-to-r from-sol to-sol-claro" style={{ scaleX: barra }} />
        </div>
        <motion.div className="absolute bottom-6 left-1/2 -translate-x-1/2" style={{ opacity: tituloO }}>
          <motion.div className="flex flex-col items-center gap-2 text-xs text-white/70" {...entra(1.2)}>
            Baje para ver su bodega con energía solar
            <span className="grid h-10 w-6 justify-center rounded-full border-2 border-white/50 pt-1.5">
              <span className="h-2 w-1 animate-bounce rounded-full bg-white" />
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

const revela = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-10%" },
};

export default function EmpresasPagina() {
  return (
    <>
      <HeaderNuevo />
      <main>
        <HeroEmpresa />

        {/* Para quién: íconos, sin fotos */}
        <section className="bg-white py-24 md:py-32">
          <div className="mx-auto max-w-7xl px-5">
            <p className="mb-4 font-semibold text-sol">Para quién</p>
            <h2 className="title max-w-3xl text-azul">
              Empresas que consumen <span className="text-sol">de día</span>
            </h2>
            <p className="mt-5 max-w-2xl text-lg text-gris">
              El sol produce justo en las horas en que su empresa más energía usa. Ahí está el ahorro.
            </p>
            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {sectores.map((s, i) => (
                <motion.article
                  key={s.title}
                  {...revela}
                  transition={{ delay: i * 0.1, duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
                  className="group relative overflow-hidden rounded-3xl bg-azul-950 p-7 text-white"
                >
                  <span aria-hidden className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(255,194,61,.3),transparent_65%)] transition-transform duration-700 group-hover:scale-150" />
                  <span className="relative grid h-14 w-14 place-items-center rounded-2xl bg-white/[.07] text-sol-claro ring-1 ring-inset ring-white/10 transition-colors duration-300 group-hover:bg-sol group-hover:text-azul-950">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      {iconos[i]}
                    </svg>
                  </span>
                  <h3 className="relative mt-8 text-xl font-semibold">{s.title}</h3>
                  <p className="relative mt-2 text-sm leading-relaxed text-white/75">{s.body}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* Lo que gana */}
        <section id="beneficios" className="relative overflow-hidden bg-azul-950 py-24 text-white md:py-32">
          <div className="pointer-events-none absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle,rgba(240,165,0,.28)_0%,transparent_65%)]" />
          <div className="relative mx-auto max-w-7xl px-5">
            <p className="mb-4 font-semibold text-sol">Lo que gana su empresa</p>
            <h2 className="title max-w-3xl">
              Ahorro mensual y <span className="text-sol">beneficios tributarios</span>
            </h2>
            <div className="mt-14 grid gap-5 md:grid-cols-2">
              {ganancias.map((g, i) => (
                <motion.article
                  key={g.title}
                  {...revela}
                  transition={{ delay: i * 0.1, duration: 0.8 }}
                  className="glass rounded-3xl p-7 transition-colors duration-300 hover:border-sol/60 md:p-9"
                >
                  <p className="text-sm font-semibold uppercase tracking-wider text-sol-claro">{g.kicker}</p>
                  <h3 className="mt-3 text-2xl font-semibold">{g.title}</h3>
                  <p className="mt-3 leading-relaxed text-white/75">{g.body}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* Proceso */}
        <section className="bg-white py-24 md:py-32">
          <div className="mx-auto max-w-7xl px-5">
            <p className="mb-4 font-semibold text-sol">Así trabajamos</p>
            <h2 className="title max-w-3xl text-azul">
              De la factura al sistema <span className="text-sol">funcionando</span>
            </h2>
            <ol className="relative mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              <motion.span
                aria-hidden
                className="absolute left-0 right-0 top-6 hidden h-0.5 origin-left bg-gradient-to-r from-sol to-sol-claro lg:block"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, margin: "-20%" }}
                transition={{ duration: 1.6, ease: [0.7, 0, 0.2, 1] }}
              />
              {pasos.map((p, i) => (
                <motion.li key={p.title} {...revela} transition={{ delay: 0.2 + i * 0.15, duration: 0.7 }} className="relative">
                  <span className="relative z-10 grid h-12 w-12 place-items-center rounded-full bg-azul text-lg font-bold text-sol-claro ring-8 ring-white">
                    {i + 1}
                  </span>
                  <h3 className="mt-5 text-xl font-semibold text-azul">{p.title}</h3>
                  <p className="mt-2 leading-relaxed text-gris">{p.body}</p>
                </motion.li>
              ))}
            </ol>
          </div>
        </section>

        {/* Preguntas */}
        <section className="bg-humo py-24 md:py-32">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-[1fr_1.4fr]">
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

        {/* Cierre: luces que corren, sin foto */}
        <section className="relative overflow-hidden bg-azul-950 py-28 text-white md:py-36">
          <div aria-hidden className="absolute inset-0 opacity-60">
            {[18, 38, 58, 78].map((top, i) => (
              <span key={top} className="absolute inset-x-0 h-px bg-white/[.06]" style={{ top: `${top}%` }}>
                <motion.span
                  className="absolute top-[-1px] h-[3px] w-40 rounded-full bg-gradient-to-r from-transparent via-sol-claro to-transparent shadow-[0_0_14px_rgba(255,194,61,.8)]"
                  animate={{ left: ["-15%", "110%"] }}
                  transition={{ duration: 4 + i, repeat: Infinity, ease: "linear", delay: i * 0.8 }}
                />
              </span>
            ))}
          </div>
          <div className="relative mx-auto max-w-3xl px-5 text-center">
            <h2 className="title">
              Mándenos la factura de energía <span className="text-sol">de su empresa</span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-white/80">
              Le decimos cuánto puede ahorrar y en cuánto tiempo se paga el sistema. Sin costo y sin compromiso.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <a href={waEmpresas} target="_blank" rel="noopener noreferrer" className="btn-sol shine">
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
          Ir al inicio
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
    </>
  );
}
