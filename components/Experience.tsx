"use client";

import { motion } from "framer-motion";

export default function Experience() {
  return (
    <section className="py-24 px-4 md:px-12 max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center" id="nosotros">
      <div className="relative">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl"></div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass p-2 rounded-2xl"
        >
          <img 
            className="rounded-xl w-full h-[500px] object-cover" 
            alt="Ingeniería y Sostenibilidad" 
            src="https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80&w=2070&auto=format&fit=crop"
          />
        </motion.div>
      </div>
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
      >
        <span className="text-primary text-xs font-bold uppercase tracking-widest mb-4 block">Experiencia Corporativa</span>
        <h2 className="font-headline-lg text-4xl text-on-surface mb-8">Visión de Ingeniería y Capacidades Técnicas</h2>
        <p className="text-on-surface-variant mb-6 text-lg">
          SOLPOWER X se consolida con la misión de democratizar la energía limpia a través de la excelencia técnica. No solo instalamos paneles; diseñamos sistemas de integración energética de precisión que aprenden de su consumo.
        </p>
        
        <div className="space-y-6 mt-8">
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-3 rounded-lg text-primary mt-1">
              <span className="material-symbols-outlined">verified</span>
            </div>
            <div>
              <h5 className="text-on-surface font-bold text-lg">Ética e Ingeniería</h5>
              <p className="text-on-surface-variant text-sm">Transparencia total en presupuestos y proyecciones de ahorro a largo plazo.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-3 rounded-lg text-primary mt-1">
              <span className="material-symbols-outlined">public</span>
            </div>
            <div>
              <h5 className="text-on-surface font-bold text-lg">Impacto Sostenible</h5>
              <p className="text-on-surface-variant text-sm">Comprometidos con la transición energética justa y normada en Colombia.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
