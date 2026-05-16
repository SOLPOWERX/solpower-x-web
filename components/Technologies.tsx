"use client";

import { motion } from "framer-motion";

const technologies = [
  { name: "RETIE", desc: "Cumplimiento normativo integral", icon: "rule" },
  { name: "NTC 2050", desc: "Código eléctrico nacional", icon: "book" },
  { name: "IEC", desc: "Estándares internacionales", icon: "public" },
  { name: "Huawei", desc: "Inversores de alta eficiencia", icon: "solar_power" },
  { name: "Growatt", desc: "Sistemas de conversión avanzados", icon: "bolt" },
  { name: "Canadian Solar", desc: "Módulos fotovoltaicos Tier 1", icon: "grid_view" },
  { name: "Trina Solar", desc: "Tecnología Vertex ultra-potente", icon: "wb_sunny" },
  { name: "PVSyst", desc: "Simulación de rendimiento 3D", icon: "analytics" },
];

export default function Technologies() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.4 } }
  };

  return (
    <section className="py-24 px-4 md:px-12 max-w-[1440px] mx-auto bg-background" id="tecnologias">
      <div className="mb-16 flex flex-col items-center text-center">
        <span className="text-primary text-xs font-bold uppercase tracking-widest mb-4">Calidad Certificada</span>
        <h2 className="font-headline-lg text-4xl text-on-surface mb-6 uppercase tracking-tight">Tecnologías y Normativas</h2>
        <div className="h-1 w-24 bg-primary/50 mb-6"></div>
        <p className="text-on-surface-variant max-w-2xl text-sm">
          Trabajamos exclusivamente con fabricantes Tier 1 y herramientas de ingeniería líderes en el mundo, garantizando instalaciones que superan los estándares del Reglamento Técnico de Instalaciones Eléctricas (RETIE).
        </p>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
      >
        {technologies.map((tech) => (
          <motion.div 
            key={tech.name}
            variants={item}
            className="bg-surface p-6 rounded-xl border border-on-surface-variant/10 hover:border-primary/40 hover:bg-surface-container transition-all duration-300 flex flex-col items-center text-center group"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <span className="material-symbols-outlined text-primary">{tech.icon}</span>
            </div>
            <h4 className="text-on-surface font-bold uppercase tracking-wider text-sm mb-2">{tech.name}</h4>
            <p className="text-on-surface-variant text-xs">{tech.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
