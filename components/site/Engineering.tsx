"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { engineering } from "@/lib/content";

export default function Engineering() {
  const [active, setActive] = useState(0);

  return (
    <section id="ingenieria" className="bg-azul-950 py-24 text-white md:py-32">
      <div className="mx-auto max-w-6xl px-5">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="mb-4 font-semibold text-sol">Ingeniería eléctrica</p>
            <h2 className="title max-w-2xl">
              Servicios complementarios <span className="text-sol">de ingeniería</span>
            </h2>
          </div>
          <p className="max-w-sm text-white/70">Cumplimiento normativo y estabilidad para sistemas críticos, del poste al tablero.</p>
        </div>

        {/* Escritorio: paneles que se expanden al pasar el mouse */}
        <div className="mt-14 hidden h-[560px] gap-3 lg:flex">
          {engineering.map((e, i) => {
            const on = i === active;
            return (
              <motion.button
                key={e.title}
                type="button"
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                animate={{ flexGrow: on ? 4.5 : 1 }}
                transition={{ duration: 0.7, ease: [0.7, 0, 0.2, 1] }}
                className="group relative basis-0 overflow-hidden rounded-[24px] text-left"
                aria-expanded={on}
              >
                <Image
                  src={`${e.image}?w=1400&q=70&auto=format`}
                  alt=""
                  fill
                  sizes="60vw"
                  className={`object-cover transition-transform duration-[1.2s] ${on ? "scale-100" : "scale-125 grayscale-[40%]"}`}
                />
                <div className={`absolute inset-0 transition-colors duration-700 ${on ? "bg-gradient-to-t from-azul-950 via-azul-950/30 to-transparent" : "bg-azul-950/60"}`} />
                <div className="absolute inset-x-0 bottom-0 p-7">
                  <h3
                    className={`font-bold leading-tight transition-all duration-500 ${
                      on ? "text-3xl" : "whitespace-nowrap text-lg [writing-mode:vertical-rl] rotate-180"
                    }`}
                  >
                    {e.title}
                  </h3>
                  <motion.p
                    initial={false}
                    animate={{ opacity: on ? 1 : 0, y: on ? 0 : 20 }}
                    transition={{ duration: 0.5, delay: on ? 0.25 : 0 }}
                    className="mt-3 max-w-md text-white/85"
                  >
                    {e.body}
                  </motion.p>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Celular y tablet: tarjetas */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:hidden">
          {engineering.map((e, i) => (
            <motion.article
              key={e.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.7, delay: (i % 2) * 0.1 }}
              className="relative h-72 overflow-hidden rounded-[24px]"
            >
              <Image src={`${e.image}?w=900&q=70&auto=format`} alt="" fill sizes="(min-width:640px) 50vw, 100vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-azul-950 via-azul-950/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <h3 className="text-2xl font-bold">{e.title}</h3>
                <p className="mt-2 text-white/80">{e.body}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
