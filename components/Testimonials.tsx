"use client";

import { motion } from "framer-motion";

export default function Testimonials() {
  return (
    <section className="py-24 px-4 md:px-12 max-w-[1440px] mx-auto bg-surface-container-low border-y border-on-surface-variant/5">
      <div className="text-center mb-16">
        <span className="text-primary text-xs font-bold uppercase tracking-widest mb-4 block">Testimonios</span>
        <h2 className="font-headline-lg text-4xl text-on-surface mb-4 uppercase tracking-tight">Lo que dicen nuestros clientes</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[1, 2, 3].map((item) => (
          <motion.div 
            key={item}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: item * 0.1 }}
            className="glass p-8 rounded-xl border border-on-surface-variant/10 relative"
          >
            <span className="material-symbols-outlined text-primary/20 text-6xl absolute top-4 right-4">format_quote</span>
            <div className="flex gap-1 text-solar-yellow mb-6">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              ))}
            </div>
            <p className="text-on-surface-variant italic mb-8 relative z-10 text-sm">
              «El nivel de detalle técnico y el acompañamiento durante todo el proyecto superó nuestras expectativas. La reducción en la factura es exactamente la proyectada.»
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-surface-container-highest rounded-full"></div>
              <div>
                <h4 className="text-on-surface font-bold text-sm">Cliente Corporativo {item}</h4>
                <p className="text-on-surface-variant text-xs">Sector Industrial</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
