"use client";

import { motion } from "framer-motion";

type Statistic = {
  id: string;
  name: string;
  value: string;
  subtext: string;
  visible: boolean;
};

type HeroProps = {
  stats: Statistic[];
};

export default function Hero({ stats }: HeroProps) {
  const visibleStats = stats.filter((stat) => stat.visible);

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-mesh pt-24">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-background/80 z-10" />
        <img 
          className="w-full h-full object-cover opacity-40 mix-blend-overlay" 
          alt="Instalación solar industrial en Colombia" 
          src="https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=2072&auto=format&fit=crop"
        />
      </div>
      
      <div className="relative z-20 px-4 md:px-12 max-w-[1440px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-block bg-primary-container text-on-primary-container px-3 md:px-4 py-1 rounded-full text-xs font-bold mb-4 md:mb-6 tracking-widest uppercase border border-primary/20 shadow-[0_0_15px_rgba(2,102,255,0.2)]">
            Ingeniería de Precisión en Colombia
          </span>
          
          <h1 className="font-headline-xl text-3xl sm:text-4xl md:text-5xl lg:text-7xl text-on-surface mb-4 md:mb-6 leading-tight tracking-tighter">
            Energía Inteligente <br/> <span className="text-primary text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary-container">para el Futuro</span>
          </h1>
          
          <p className="text-sm sm:text-base md:text-lg text-on-surface-variant mb-6 md:mb-10 max-w-xl font-light">
            Soluciones avanzadas en energía solar, ingeniería eléctrica y eficiencia energética. Integramos el poder para su industria y hogar con los más altos estándares técnicos.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <a href="#contacto" className="bg-solar-yellow text-background px-6 sm:px-8 py-3 md:py-4 rounded-lg font-bold uppercase tracking-widest hover:scale-105 transition-transform duration-200 pulse-yellow text-center text-xs sm:text-sm">
              Solicitar Cotización
            </a>
            <a href="#solar" className="glass px-6 sm:px-8 py-3 md:py-4 rounded-lg text-on-surface uppercase tracking-widest hover:bg-white/5 transition-colors duration-200 text-center text-xs sm:text-sm font-medium border-on-surface-variant/20">
              Conocer Servicios
            </a>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-16 flex flex-wrap gap-12 border-t border-on-surface-variant/10 pt-10"
          >
            {visibleStats.map((stat) => (
              <div key={stat.id}>
                <div className="text-3xl font-headline-sm text-primary mb-1">{stat.value}</div>
                <div className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{stat.subtext}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
