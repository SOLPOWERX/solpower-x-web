"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ingenierias } from "@/lib/nueva";

/** Ingeniería en dos ramas: solar y servicios eléctricos. */
export default function IngenieriaDos() {
  return (
    <section id="ingenieria" className="bg-humo py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="mb-4 font-semibold text-sol">Ingeniería</p>
            <h2 className="title max-w-2xl text-azul">
              Un ingeniero que diseña, <span className="text-sol">firma y responde</span>
            </h2>
          </div>
          <p className="max-w-sm text-gris">Dos frentes de trabajo, el mismo cumplimiento: RETIE, NTC 2050 e IEEE 80.</p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {ingenierias.map((g, gi) => (
            <motion.article
              key={g.id}
              id={g.id}
              className="group overflow-hidden rounded-[28px] bg-azul-950 text-white shadow-[0_30px_80px_-40px_rgba(4,15,38,.8)]"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ delay: gi * 0.15, duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <div className="relative h-60 overflow-hidden md:h-72">
                <Image
                  src={g.image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-110"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-azul-950 via-azul-950/40 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-7">
                  <span className="rounded-full bg-sol px-3 py-1 text-xs font-semibold text-azul-950">{g.kicker}</span>
                  <h3 className="mt-3 text-3xl font-bold md:text-4xl">{g.title}</h3>
                </div>
              </div>
              <div className="p-7 pt-5">
                <p className="text-white/70">{g.body}</p>
                <ul className="mt-6 divide-y divide-white/10">
                  {g.items.map((it, i) => (
                    <li key={it.title}>
                      <a
                        href="#contacto"
                        className="group/item flex items-center gap-4 py-4 transition-colors hover:text-sol-claro"
                      >
                        <span className="text-xs font-semibold text-sol">0{i + 1}</span>
                        <span className="flex-1">
                          <span className="block font-semibold">{it.title}</span>
                          <span className="block text-sm text-white/55">{it.body}</span>
                        </span>
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 transition-all duration-300 group-hover/item:translate-x-1 group-hover/item:bg-sol group-hover/item:text-azul-950">
                          →
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
