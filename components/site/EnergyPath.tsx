"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** Cada parada del diagrama unifilar es un servicio. El orden sigue el recorrido real de la energía. */
const stages = [
  {
    node: "Generador FV",
    title: "Sistemas solares",
    body: "Diseño de sistemas fotovoltaicos on-grid, off-grid e híbridos con baterías. Dimensionamos paneles, estructura y almacenamiento según tu consumo real.",
    items: ["On-grid con autoconsumo", "Off-grid y respaldo con baterías", "Estudio de consumo y producción"],
  },
  {
    node: "Inversor",
    title: "Conversión y protección DC",
    body: "Selección de inversores, cableado DC, protecciones y canalizaciones. Cada conductor y cada protección quedan calculados y justificados.",
    items: ["Cálculo de conductores DC y AC", "Protecciones y seccionamiento", "Canalizaciones y bandejas"],
  },
  {
    node: "Transformador",
    title: "Media tensión y subestaciones",
    body: "Diseño de subestaciones y redes de media tensión para industria, comercio y proyectos de generación.",
    items: ["Subestaciones tipo poste y patio", "Redes de media tensión", "Coordinación de protecciones"],
  },
  {
    node: "Tablero",
    title: "Redes de baja tensión",
    body: "Instalaciones internas, tableros y sistemas de puesta a tierra conforme a NTC 2050 e IEEE 80.",
    items: ["Diseño de tableros y circuitos", "Malla de puesta a tierra", "Regulación y pérdidas"],
  },
  {
    node: "Red",
    title: "Certificación RETIE",
    body: "Memorias de cálculo, planos y declaración de cumplimiento para que tu instalación pase la inspección y se conecte al operador de red.",
    items: ["Memoria de cálculo RETIE", "Declaración de cumplimiento", "Trámite con el operador de red"],
  },
];

// Posición X de cada nodo en el viewBox (1200 de ancho)
const NODE_X = [250, 480, 710, 940, 1140];
const LINE_Y = 120;

export default function EnergyPath() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<SVGPathElement>(null);
  const [active, setActive] = useState(0);
  const [animated, setAnimated] = useState(true);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setAnimated(false);
      return;
    }
    const line = lineRef.current!;
    const length = line.getTotalLength();
    gsap.set(line, { strokeDasharray: length, strokeDashoffset: length });

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        pin: pinRef.current,
        start: "top top",
        end: () => `+=${window.innerHeight * stages.length}`,
        scrub: true,
        snap: { snapTo: 1 / (stages.length - 1), duration: 0.4, ease: "power2.out", delay: 0.05 },
        onUpdate: (self) => {
          // La línea llega a cada nodo justo cuando su servicio se muestra
          const p = self.progress;
          const reach = 0.12 + p * 0.88;
          gsap.set(line, { strokeDashoffset: length * (1 - reach) });
          setActive(Math.min(stages.length - 1, Math.round(p * (stages.length - 1))));
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const lit = (i: number) => !animated || i <= active;

  return (
    <section id="servicios" ref={sectionRef} className="bg-noche text-white" aria-label="Servicios">
      <div ref={pinRef} className="blueprint flex min-h-svh flex-col justify-center py-24">
        <div className="mx-auto w-full max-w-6xl px-4 md:px-8">
          <h2 className="wide mb-2 text-sm font-semibold text-sol">Servicios</h2>
          <p className="mb-10 max-w-lg text-niebla">
            Cada servicio es una parte del recorrido de la energía, desde el panel hasta la red.
          </p>

          {/* Diagrama unifilar */}
          <svg
            viewBox="0 0 1200 230"
            className="w-full overflow-visible"
            role="img"
            aria-label="Diagrama unifilar: sol, generador fotovoltaico, inversor, transformador, tablero y red"
          >
            {/* línea base */}
            <path d={`M70 ${LINE_Y} H1180`} stroke="#7f96c2" strokeOpacity="0.35" strokeWidth="2" fill="none" />
            {/* línea de energía */}
            <path
              ref={lineRef}
              d={`M70 ${LINE_Y} H1180`}
              stroke="#f0a500"
              strokeWidth="3"
              fill="none"
              style={animated ? undefined : { strokeDasharray: "none" }}
            />

            {/* Sol */}
            <g stroke="#f0a500" strokeWidth="2.5" fill="none">
              <circle cx="70" cy={LINE_Y} r="20" fill="#071733" />
              {Array.from({ length: 8 }).map((_, i) => {
                const a = (i * Math.PI) / 4;
                return (
                  <line
                    key={i}
                    x1={70 + Math.cos(a) * 28}
                    y1={LINE_Y + Math.sin(a) * 28}
                    x2={70 + Math.cos(a) * 38}
                    y2={LINE_Y + Math.sin(a) * 38}
                  />
                );
              })}
            </g>

            {NODE_X.map((x, i) => {
              const on = lit(i);
              const c = on ? "#f0a500" : "#7f96c2";
              return (
                <g key={i} style={{ transition: "opacity .5s" }} opacity={on ? 1 : 0.55}>
                  <g stroke={c} strokeWidth="2.5" fill="#071733" style={{ transition: "stroke .5s" }}>
                    {i === 0 && (
                      <>
                        <rect x={x - 32} y={LINE_Y - 24} width="64" height="48" />
                        <line x1={x - 32} y1={LINE_Y - 8} x2={x + 32} y2={LINE_Y - 8} />
                        <line x1={x - 32} y1={LINE_Y + 8} x2={x + 32} y2={LINE_Y + 8} />
                        <line x1={x - 11} y1={LINE_Y - 24} x2={x - 11} y2={LINE_Y + 24} />
                        <line x1={x + 11} y1={LINE_Y - 24} x2={x + 11} y2={LINE_Y + 24} />
                      </>
                    )}
                    {i === 1 && (
                      <>
                        <rect x={x - 28} y={LINE_Y - 28} width="56" height="56" />
                        <line x1={x - 28} y1={LINE_Y + 28} x2={x + 28} y2={LINE_Y - 28} />
                        <line x1={x - 20} y1={LINE_Y - 16} x2={x - 6} y2={LINE_Y - 16} />
                        <line x1={x - 20} y1={LINE_Y - 11} x2={x - 6} y2={LINE_Y - 11} strokeDasharray="3 3" />
                        <path d={`M${x + 4} ${LINE_Y + 14} q5 -7 10 0 t10 0`} fill="none" />
                      </>
                    )}
                    {i === 2 && (
                      <>
                        <circle cx={x - 12} cy={LINE_Y} r="22" />
                        <circle cx={x + 12} cy={LINE_Y} r="22" fillOpacity="0" />
                      </>
                    )}
                    {i === 3 && (
                      <>
                        <rect x={x - 28} y={LINE_Y - 30} width="56" height="60" />
                        <line x1={x - 12} y1={LINE_Y + 8} x2={x + 10} y2={LINE_Y - 10} />
                        <circle cx={x - 12} cy={LINE_Y + 8} r="3" />
                        <line x1={x} y1={LINE_Y + 30} x2={x} y2={LINE_Y + 52} />
                        <line x1={x - 16} y1={LINE_Y + 52} x2={x + 16} y2={LINE_Y + 52} />
                        <line x1={x - 10} y1={LINE_Y + 58} x2={x + 10} y2={LINE_Y + 58} />
                        <line x1={x - 4} y1={LINE_Y + 64} x2={x + 4} y2={LINE_Y + 64} />
                      </>
                    )}
                    {i === 4 && (
                      <>
                        <line x1={x - 8} y1={LINE_Y - 26} x2={x - 8} y2={LINE_Y + 26} />
                        <line x1={x} y1={LINE_Y - 26} x2={x} y2={LINE_Y + 26} />
                        <line x1={x + 8} y1={LINE_Y - 26} x2={x + 8} y2={LINE_Y + 26} />
                      </>
                    )}
                  </g>
                  <text
                    className="hidden md:block"
                    x={x}
                    y={i === 3 ? LINE_Y + 90 : LINE_Y + 66}
                    textAnchor="middle"
                    fill={on ? "#ffffff" : "#7f96c2"}
                    fontSize="15"
                    style={{ transition: "fill .5s" }}
                  >
                    {stages[i].node}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Texto del servicio activo */}
          {animated ? (
            <div className="relative mt-10 min-h-[300px] md:mt-14 md:min-h-[230px]">
              {stages.map((s, i) => (
                <article
                  key={s.title}
                  aria-hidden={i !== active}
                  className={`absolute inset-0 grid gap-6 transition-[opacity,transform] md:grid-cols-[1.1fr_1fr] md:gap-16 ${
                    i === active
                      ? "translate-y-0 opacity-100 delay-150 duration-500"
                      : "pointer-events-none translate-y-3 opacity-0 duration-150"
                  }`}
                >
                  <StageText stage={s} />
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-12 space-y-16">
              {stages.map((s) => (
                <article key={s.title} className="grid gap-6 md:grid-cols-[1.1fr_1fr] md:gap-16">
                  <StageText stage={s} />
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function StageText({ stage }: { stage: (typeof stages)[number] }) {
  return (
    <>
      <div>
        <p className="mb-3 text-sm font-semibold text-sol md:hidden">{stage.node}</p>
        <h3 className="display text-[clamp(2rem,4.5vw,3.5rem)]">{stage.title}</h3>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-niebla">{stage.body}</p>
      </div>
      <ul className="space-y-3 self-end border-l border-sol/60 pl-6 text-white">
        {stage.items.map((it) => (
          <li key={it}>{it}</li>
        ))}
      </ul>
    </>
  );
}
