"use client";

import { motion } from "framer-motion";

export default function Clients() {
  return (
    <section className="py-16 border-b border-on-surface-variant/5">
      <div className="px-4 md:px-12 max-w-[1440px] mx-auto text-center">
        <p className="text-on-surface-variant text-xs uppercase tracking-widest mb-8 font-bold">Empresas que confían en nuestra ingeniería</p>
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60">
          {[1, 2, 3, 4, 5].map((item) => (
            <motion.div 
              key={item}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: item * 0.1 }}
              className="text-on-surface-variant font-bold text-xl uppercase tracking-widest flex items-center gap-2 filter grayscale hover:grayscale-0 transition-all duration-300 hover:text-primary"
            >
              <span className="material-symbols-outlined">domain</span>
              Marca {item}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
