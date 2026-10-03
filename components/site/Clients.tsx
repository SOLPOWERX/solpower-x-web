"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { clients } from "@/lib/content";

export default function Clients() {
  return (
    <section id="clientes" className="relative overflow-hidden bg-white py-24 md:py-32">
      <div className="pointer-events-none absolute -left-40 top-10 h-[26rem] w-[26rem] rounded-full bg-sol/15 blur-3xl" />
      <div className="relative mx-auto max-w-6xl px-5">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <p className="mb-4 font-semibold text-sol">Nuestros clientes</p>
          <h2 className="title text-azul">
            Empresas que <span className="text-sol">confían en nosotros</span>
          </h2>
        </motion.div>

        {clients.length > 2 ? (
          // Con varios clientes: franja continua de logos
          <div className="mt-14 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
            <ul className="marquee flex w-max items-center gap-6">
              {[...clients, ...clients].map((c, i) => (
                <li key={i} aria-hidden={i >= clients.length} className="grid h-28 w-64 place-items-center rounded-3xl border border-azul/10 bg-humo px-8">
                  <Image src={c.logo} alt={c.name} width={220} height={60} className="h-auto max-h-14 w-auto object-contain" />
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="mx-auto mt-14 grid max-w-4xl gap-6 sm:grid-cols-2">
            {clients.map((c, i) => (
              <motion.article
                key={c.name}
                initial={{ opacity: 0, y: 60, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.9, delay: i * 0.12, ease: [0.2, 0.8, 0.2, 1] }}
                className="overflow-hidden rounded-[32px] border border-azul/10 bg-white shadow-[0_40px_80px_-45px_rgba(13,43,94,.55)]"
              >
                <a
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative grid min-h-56 place-items-center overflow-hidden bg-humo p-10"
                  aria-label={`Sitio web de ${c.name}`}
                >
                  <motion.span
                    aria-hidden
                    className="absolute h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(240,165,0,.28),transparent_70%)]"
                    animate={{ scale: [1, 1.25, 1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <motion.span
                    className="relative block"
                    initial={{ clipPath: "inset(0 100% 0 0)" }}
                    whileInView={{ clipPath: "inset(0 0% 0 0)" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, delay: 0.35, ease: [0.7, 0, 0.2, 1] }}
                  >
                    <Image
                      src={c.logo}
                      alt={c.name}
                      width={360}
                      height={100}
                      className="h-auto w-full max-w-[320px] transition-transform duration-500 group-hover:scale-105"
                    />
                  </motion.span>
                </a>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
