"use client";

import { motion, useMotionTemplate, useTransform, type MotionValue } from "framer-motion";
import type { ReactNode } from "react";

type MV = MotionValue<number>;

const celdas = Array.from({ length: 60 });

/** Capas del panel, de abajo hacia arriba. */
const capas: { label?: string; className: string; content?: ReactNode }[] = [
  {
    label: "Caja de conexiones IP68",
    className: "grid place-items-start justify-center pt-[14%]",
    content: (
      <span className="relative block h-[10%] min-h-5 w-[34%] rounded-md bg-gradient-to-b from-[#2a3242] to-[#11161f] shadow-[0_6px_14px_rgba(0,0,0,.5)]">
        <span className="absolute -bottom-6 left-[22%] h-6 w-[3px] rounded bg-[#11161f]" />
        <span className="absolute -bottom-6 right-[22%] h-6 w-[3px] rounded bg-[#a3161b]" />
      </span>
    ),
  },
  {
    label: "Marco de aluminio anodizado",
    className:
      "rounded-[6px] border-[7px] border-[#c9d3e1] shadow-[inset_0_0_0_1px_rgba(255,255,255,.6),0_0_0_1px_rgba(0,0,0,.25)] [border-top-color:#e6ecf4] [border-left-color:#dbe3ee]",
  },
  { label: "Lámina posterior", className: "rounded-[4px] bg-gradient-to-br from-[#f1f4f9] to-[#cfd8e5]" },
  { label: "Encapsulante EVA", className: "rounded-[4px] bg-white/15 ring-1 ring-inset ring-white/30" },
  {
    label: "Celdas monocristalinas",
    className: "rounded-[4px] bg-[#071833] p-[5%]",
    content: (
      <span className="grid h-full w-full grid-cols-6 grid-rows-10 gap-[3%]">
        {celdas.map((_, i) => (
          <span
            key={i}
            className="rounded-[1px] bg-[linear-gradient(135deg,#2c66c4_0%,#123a7a_55%,#0b2a5c_100%)] [background-image:linear-gradient(90deg,transparent_31%,rgba(255,255,255,.28)_32%,transparent_33%,transparent_65%,rgba(255,255,255,.28)_66%,transparent_67%),linear-gradient(135deg,#2c66c4_0%,#123a7a_55%,#0b2a5c_100%)]"
          />
        ))}
      </span>
    ),
  },
  { className: "rounded-[4px] bg-white/10 ring-1 ring-inset ring-white/25" },
  {
    label: "Vidrio templado 3,2 mm",
    className:
      "rounded-[5px] bg-[linear-gradient(125deg,rgba(255,255,255,.42)_0%,rgba(255,255,255,.06)_32%,rgba(255,255,255,0)_50%,rgba(255,255,255,.18)_62%,rgba(255,255,255,.02)_80%)] ring-1 ring-inset ring-white/45",
  },
];

function Capa({
  i,
  gap,
  labels,
  counter,
  label,
  className,
  children,
}: {
  i: number;
  gap: MV;
  labels?: MV;
  counter: MotionValue<string>;
  label?: string;
  className: string;
  children?: ReactNode;
}) {
  const z = useTransform(gap, (g) => (i - 3) * g);
  return (
    <motion.div className={`absolute inset-0 ${className}`} style={{ z, transformStyle: "preserve-3d" }}>
      {children}
      {label && labels && (
        <motion.span
          className="pointer-events-none absolute left-full top-[38%] hidden lg:block"
          style={{ opacity: labels, transformStyle: "preserve-3d" }}
        >
          <motion.span className="block origin-left" style={{ transform: counter }}>
            <span className="flex items-center gap-2 whitespace-nowrap pl-3 text-xs font-medium text-white/85">
              <span className="h-px w-28 bg-gradient-to-r from-sol-claro/0 to-sol-claro" />
              <span className="h-1.5 w-1.5 rounded-full bg-sol-claro shadow-[0_0_8px_2px_rgba(255,194,61,.7)]" />
              {label}
            </span>
          </motion.span>
        </motion.span>
      )}
    </motion.div>
  );
}

/**
 * Panel solar en 3D hecho solo con CSS. `gap` separa las capas (0 = armado),
 * `rotX`/`rotZ` lo giran y `labels` muestra los nombres de cada capa.
 */
export default function Panel3D({
  width,
  rotX,
  rotZ,
  gap,
  labels,
}: {
  width: string;
  rotX: MV;
  rotZ: MV;
  gap: MV;
  labels?: MV;
}) {
  const transform = useMotionTemplate`rotateX(${rotX}deg) rotateZ(${rotZ}deg)`;
  const negX = useTransform(rotX, (v) => -v);
  const negZ = useTransform(rotZ, (v) => -v);
  const counter = useMotionTemplate`rotateZ(${negZ}deg) rotateX(${negX}deg)`;
  const sombra = useTransform(gap, (g) => -3 * g - 40);

  return (
    <div className="relative" style={{ width, perspective: "1600px" }}>
      <motion.div className="relative aspect-[6/10] w-full" style={{ transform, transformStyle: "preserve-3d" }}>
        <motion.div
          aria-hidden
          className="absolute inset-[6%] rounded-[30px] bg-black/60 blur-2xl"
          style={{ z: sombra }}
        />
        {capas.map((c, i) => (
          <Capa key={i} i={i} gap={gap} labels={labels} counter={counter} label={c.label} className={c.className}>
            {c.content}
          </Capa>
        ))}
      </motion.div>
    </div>
  );
}
