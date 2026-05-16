"use client";

import { motion } from "framer-motion";

export default function Services() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <>
      {/* Solar Ecosystem */}
      <section className="py-16 md:py-24 px-3 md:px-8 lg:px-12 max-w-[1440px] mx-auto" id="solar">
        <div className="mb-12 md:mb-16 text-center max-w-2xl mx-auto">
          <h2 className="font-headline-lg text-2xl sm:text-3xl md:text-4xl text-on-surface mb-3 md:mb-4">Ecosistema Solar Fotovoltaico</h2>
          <div className="h-1 w-16 md:w-24 bg-primary mx-auto mb-4 md:mb-6"></div>
          <p className="text-on-surface-variant text-sm md:text-base">Maximizamos su retorno de inversión mediante sistemas diseñados para el clima y la infraestructura de toda Colombia.</p>
        </div>

        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8"
        >
          {/* Card 1 */}
          <motion.div variants={item} className="glass p-5 md:p-8 rounded-xl group hover:border-primary/50 transition-all duration-300 energy-glow relative overflow-hidden">
            <span className="material-symbols-outlined text-solar-yellow text-3xl md:text-4xl mb-4 md:mb-6 block relative z-10">solar_power</span>
            <h3 className="font-headline-sm text-lg md:text-2xl text-on-surface mb-3 md:mb-4 relative z-10">Sistemas On-Grid</h3>
            <p className="text-on-surface-variant mb-4 md:mb-6 text-xs md:text-sm relative z-10">Conéctese a la red y reduzca su factura hasta en un 90% mediante la ley de excedentes.</p>
            <ul className="space-y-2 md:space-y-3 text-on-surface-variant mb-6 md:mb-8 text-xs md:text-sm relative z-10">
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-sm">check_circle</span> ROI en 3-5 años</li>
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-sm">check_circle</span> Mantenimiento simplificado</li>
            </ul>
          </motion.div>

          {/* Card 2 */}
          <motion.div variants={item} className="glass p-5 md:p-8 rounded-xl group hover:border-primary/50 transition-all duration-300 border-primary/20 bg-primary-container/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent z-0"></div>
            <span className="material-symbols-outlined text-solar-yellow text-3xl md:text-4xl mb-4 md:mb-6 block relative z-10">battery_charging_full</span>
            <h3 className="font-headline-sm text-lg md:text-2xl text-on-surface mb-3 md:mb-4 relative z-10">Sistemas Híbridos</h3>
            <p className="text-on-surface-variant mb-4 md:mb-6 text-xs md:text-sm relative z-10">Lo mejor de ambos mundos: ahorro energético y respaldo total ante fallas eléctricas.</p>
            <ul className="space-y-2 md:space-y-3 text-on-surface-variant mb-6 md:mb-8 text-xs md:text-sm relative z-10">
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-sm">check_circle</span> Backup de energía 24/7</li>
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-sm">check_circle</span> Gestión inteligente de baterías</li>
            </ul>
          </motion.div>

          {/* Card 3 */}
          <motion.div variants={item} className="glass p-5 md:p-8 rounded-xl group hover:border-primary/50 transition-all duration-300 relative overflow-hidden">
            <span className="material-symbols-outlined text-solar-yellow text-3xl md:text-4xl mb-4 md:mb-6 block relative z-10">engineering</span>
            <h3 className="font-headline-sm text-lg md:text-2xl text-on-surface mb-3 md:mb-4 relative z-10">Mantenimiento</h3>
            <p className="text-on-surface-variant mb-4 md:mb-6 text-xs md:text-sm relative z-10">Garantice el máximo rendimiento de sus paneles con limpieza profesional y termografía.</p>
            <ul className="space-y-2 md:space-y-3 text-on-surface-variant mb-6 md:mb-8 text-xs md:text-sm relative z-10">
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-sm">check_circle</span> Monitoreo en tiempo real</li>
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-sm">check_circle</span> Informes de desempeño</li>
            </ul>
          </motion.div>
        </motion.div>
      </section>

      {/* Engineering Services */}
      <section className="bg-surface-container py-16 md:py-24 border-y border-on-surface-variant/5" id="engineering">
        <div className="px-3 md:px-8 lg:px-12 max-w-[1440px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 md:mb-16 gap-4 md:gap-6">
            <div className="max-w-xl">
              <h2 className="font-headline-lg text-2xl sm:text-3xl md:text-4xl text-on-surface mb-3 md:mb-4 uppercase tracking-tight">Servicios Complementarios de Ingeniería</h2>
              <p className="text-on-surface-variant italic text-sm md:text-base">Cumplimiento normativo y estabilidad para sistemas críticos.</p>
            </div>
            <button className="bg-white/5 border border-white/10 text-on-surface px-4 md:px-6 py-2 md:py-3 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-colors whitespace-nowrap">
              Portafolio Técnico
            </button>
          </div>

          <motion.div 
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <motion.div variants={item} className="bg-surface p-6 rounded-lg border-l-4 border-secondary hover:-translate-y-1 transition-transform duration-300">
              <h4 className="font-bold text-on-surface mb-2 uppercase tracking-wide text-sm">Redes de Media y Baja Tensión</h4>
              <p className="text-on-surface-variant text-sm">Diseño y ejecución de infraestructura eléctrica.</p>
            </motion.div>

            <motion.div variants={item} className="bg-surface p-6 rounded-lg border-l-4 border-primary hover:-translate-y-1 transition-transform duration-300">
              <h4 className="font-bold text-on-surface mb-2 uppercase tracking-wide text-sm">Instalaciones Eléctricas</h4>
              <p className="text-on-surface-variant text-sm">Soluciones residenciales, industriales y comerciales.</p>
            </motion.div>

            <motion.div variants={item} className="bg-surface p-6 rounded-lg border-l-4 border-solar-yellow hover:-translate-y-1 transition-transform duration-300">
              <h4 className="font-bold text-on-surface mb-2 uppercase tracking-wide text-sm">Auditoría Energética RETIE</h4>
              <p className="text-on-surface-variant text-sm">Inspección y cumplimiento de estándares de seguridad eléctrica.</p>
            </motion.div>

            <motion.div variants={item} className="bg-surface p-6 rounded-lg border-l-4 border-secondary-container hover:-translate-y-1 transition-transform duration-300">
              <h4 className="font-bold text-on-surface mb-2 uppercase tracking-wide text-sm">Calidad de Energía</h4>
              <p className="text-on-surface-variant text-sm">Estudios avanzados de armónicos y compensación.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
