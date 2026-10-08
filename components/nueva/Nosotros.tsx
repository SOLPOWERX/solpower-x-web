"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { media, values } from "@/lib/content";
import { site } from "@/lib/site";

export default function Nosotros() {
  return (
    <section id="nosotros" className="bg-white py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-2 lg:items-center">
        <motion.div
          className="relative h-[26rem] overflow-hidden rounded-[28px] md:h-[34rem]"
          initial={{ clipPath: "inset(12% 12% 12% 12% round 28px)" }}
          whileInView={{ clipPath: "inset(0% 0% 0% 0% round 28px)" }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 1.2, ease: [0.7, 0, 0.2, 1] }}
        >
          <Image src={`${media.aerialRows}?w=1400&q=70&auto=format`} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          <span className="absolute inset-0 bg-gradient-to-t from-azul-950/90 via-azul-950/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex items-center gap-4 p-7 text-white">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-white p-2">
              <Image src="/isotipo.png" alt="" width={44} height={38} />
            </span>
            <span>
              <span className="block text-lg font-semibold">{site.engineer}</span>
              <span className="block text-sm text-white/70">Ingeniero electricista · Fundador de SOLPOWER X</span>
            </span>
          </div>
        </motion.div>

        <div>
          <p className="mb-4 font-semibold text-sol">Nosotros</p>
          <h2 className="title text-azul">
            Ingeniería con <span className="text-sol">nombre propio</span>
          </h2>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-gris">
            SOLPOWER X nace para que cada proyecto tenga un responsable: el mismo ingeniero estudia su caso, diseña, firma y
            responde ante el inspector y el operador de red.
          </p>
          <ul className="mt-10 grid gap-6 sm:grid-cols-2">
            {values.map((v, i) => (
              <motion.li
                key={v.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.7 }}
                className="border-t border-azul/10 pt-5"
              >
                <h3 className="font-semibold text-azul">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gris">{v.body}</p>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
