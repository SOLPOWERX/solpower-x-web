"use client";

import { useMemo, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { incentives } from "@/lib/content";
import { site } from "@/lib/site";

type Kind = "hogar" | "empresa";

const cop = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

/** Estimación referencial. Supuestos: 4,2 h sol pico, PR 0,8, cobertura 90 %, tarifa +4 %/año, degradación 0,5 %/año. */
function estimate(bill: number, kind: Kind) {
  const tariff = kind === "hogar" ? 850 : 800;
  const kwhMonth = bill / tariff;
  const solarKwh = kwhMonth * 0.9;
  const kwp = Math.max(1, Math.round((solarKwh / 100.8) * 2) / 2);
  const costPerKwp = kind === "hogar" ? (kwp < 10 ? 4_200_000 : 3_800_000) : kwp < 50 ? 3_600_000 : 3_100_000;
  const investment = kwp * costPerKwp;
  const monthlySaving = kwp * 100.8 * tariff * 0.95;
  // Empresas: deducción de renta del 50 % de la inversión con tarifa de renta del 35 %
  const netInvestment = kind === "empresa" ? investment * (1 - 0.5 * 0.35) : investment;
  const flow: number[] = [];
  let acc = -netInvestment;
  let payback = 0;
  for (let y = 1; y <= 25; y++) {
    const yearSaving = monthlySaving * 12 * Math.pow(1.04, y - 1) * Math.pow(0.995, y - 1);
    const before = acc;
    acc += yearSaving;
    if (!payback && acc >= 0) payback = y - 1 + -before / yearSaving;
    flow.push(acc);
  }
  return {
    kwp,
    panels: Math.ceil((kwp * 1000) / 550),
    investment,
    netInvestment,
    monthlySaving,
    payback,
    total: acc,
    flow,
  };
}

export default function Analysis() {
  const [bill, setBill] = useState(600_000);
  const [kind, setKind] = useState<Kind>("hogar");
  const r = useMemo(() => estimate(bill, kind), [bill, kind]);
  const chartRef = useRef<HTMLDivElement>(null);
  const inView = useInView(chartRef, { once: true, margin: "-80px" });

  const max = kind === "hogar" ? 5_000_000 : 60_000_000;
  const min = kind === "hogar" ? 150_000 : 2_000_000;

  // Gráfica: flujo de caja acumulado
  const W = 520;
  const H = 170;
  const lo = Math.min(...r.flow, -r.netInvestment);
  const hi = Math.max(...r.flow);
  const y = (v: number) => H - ((v - lo) / (hi - lo)) * H;
  const x = (i: number) => (i / 24) * W;
  const path = r.flow.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  const zeroY = y(0);

  return (
    <section id="analisis" className="relative overflow-hidden bg-humo py-24 md:py-32">
      <div className="pointer-events-none absolute -right-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-sol/20 blur-3xl" />
      <div className="relative mx-auto grid max-w-6xl gap-14 px-5 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
        <div>
          <p className="mb-4 font-semibold text-sol">Análisis técnico-financiero</p>
          <h2 className="title text-azul">
            Antes de invertir, <span className="text-sol">conoce tus números</span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-gris">
            Cada proyecto empieza con un estudio de tu consumo y una simulación en PVsyst. Te entregamos producción
            esperada, flujo de caja a 25 años, TIR, VPN y periodo de retorno para que decidas con datos.
          </p>

          <h3 className="mt-12 text-xl font-bold text-azul">Beneficios tributarios de la Ley 1715</h3>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {incentives.map((it, i) => (
              <motion.li
                key={it.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.08, duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
                className="rounded-2xl border border-azul/10 bg-white p-5 shadow-[0_12px_30px_-20px_rgba(13,43,94,.4)]"
              >
                <p className="font-semibold text-azul">{it.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-gris">{it.body}</p>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Calculadora */}
        <div
          id="calculadora"
          className="scroll-mt-28 rounded-[32px] bg-azul p-6 text-white shadow-[0_40px_80px_-30px_rgba(13,43,94,.7)] md:p-9"
        >
          <h3 className="text-2xl font-bold">Calcula tu ahorro</h3>
          <p className="mt-1 text-sm text-white/65">Mueve la barra con el valor de tu factura mensual.</p>

          <div className="mt-6 inline-flex rounded-full bg-white/10 p-1" role="group" aria-label="Tipo de cliente">
            {(["hogar", "empresa"] as Kind[]).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => {
                  setKind(k);
                  setBill(k === "hogar" ? 600_000 : 12_000_000);
                }}
                aria-pressed={kind === k}
                className={`relative rounded-full px-5 py-2 text-sm font-semibold capitalize transition-colors ${
                  kind === k ? "text-azul-950" : "text-white/80"
                }`}
              >
                {kind === k && (
                  <motion.span layoutId="kind-pill" className="absolute inset-0 rounded-full bg-sol" transition={{ type: "spring", bounce: 0.25 }} />
                )}
                <span className="relative">{k}</span>
              </button>
            ))}
          </div>

          <label className="mt-7 block">
            <span className="flex items-baseline justify-between text-sm text-white/70">
              Factura de energía al mes
              <span className="text-2xl font-bold text-white">{cop(bill)}</span>
            </span>
            <input
              type="range"
              min={min}
              max={max}
              step={kind === "hogar" ? 50_000 : 500_000}
              value={bill}
              onChange={(e) => setBill(Number(e.target.value))}
              className="mt-4 w-full accent-[#f0a500]"
            />
          </label>

          <dl className="mt-7 grid grid-cols-2 gap-3">
            {[
              { label: "Sistema sugerido", value: `${r.kwp.toLocaleString("es-CO")} kWp`, sub: `${r.panels} paneles de 550 W` },
              { label: "Ahorro mensual", value: cop(r.monthlySaving), sub: "primer año" },
              { label: "Inversión estimada", value: cop(r.investment), sub: kind === "empresa" ? `${cop(r.netInvestment)} con Ley 1715` : "llave en mano" },
              { label: "Retorno", value: `${r.payback.toFixed(1).replace(".", ",")} años`, sub: "periodo de recuperación" },
            ].map((m) => (
              <div key={m.label} className="rounded-2xl bg-white/[.07] p-4">
                <dt className="text-xs text-white/60">{m.label}</dt>
                <dd>
                  <motion.p key={m.value} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-1 text-lg font-bold md:text-xl">
                    {m.value}
                  </motion.p>
                  <p className="text-xs text-white/55">{m.sub}</p>
                </dd>
              </div>
            ))}
          </dl>

          <div ref={chartRef} className="mt-6 rounded-2xl bg-azul-950/50 p-4">
            <p className="flex justify-between text-xs text-white/60">
              <span>Flujo de caja acumulado, 25 años</span>
              <span className="font-semibold text-sol">{cop(r.total)}</span>
            </p>
            <svg viewBox={`0 -6 ${W} ${H + 12}`} className="mt-3 w-full" role="img" aria-label={`El sistema se paga en ${r.payback.toFixed(1)} años y ahorra ${cop(r.total)} en 25 años`}>
              <line x1="0" x2={W} y1={zeroY} y2={zeroY} stroke="rgba(255,255,255,.25)" strokeDasharray="4 5" />
              <motion.path
                d={path}
                fill="none"
                stroke="#f0a500"
                strokeWidth="3.5"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: inView ? 1 : 0 }}
                transition={{ duration: 1.6, ease: [0.2, 0.7, 0.2, 1] }}
              />
              <circle cx={x(Math.min(24, r.payback))} cy={zeroY} r="6" fill="#f0a500" />
            </svg>
          </div>

          <p className="mt-5 text-xs leading-relaxed text-white/55">
            Estimación referencial. El valor real sale del estudio técnico de tu proyecto.
          </p>
          <a
            href={`${site.whatsapp}un%20an%C3%A1lisis%20t%C3%A9cnico-financiero.%20Mi%20factura%20es%20de%20${encodeURIComponent(cop(bill))}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-sol mt-6 w-full"
          >
            Pedir mi estudio detallado
          </a>
        </div>
      </div>
    </section>
  );
}
