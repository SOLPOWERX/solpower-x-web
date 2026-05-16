"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface ProjectData {
  id: string;
  name: string;
  projectType: string;
  location: string;
  powerKwp: number;
  imageUrl: string;
  partnerCompany: string;
  description: string;
  impact: string;
  technicalSpecs: string;
}

export default function ProjectDetailClient({ project }: { project: ProjectData }) {
  return (
    <main className="pt-24 bg-background">
      {/* Hero Section - More Impactful */}
      <section className="relative h-[80vh] min-h-[600px] overflow-hidden">
        <motion.div 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <img
            src={project.imageUrl}
            alt={project.name}
            className="w-full h-full object-cover"
          />
        </motion.div>
        
        {/* Deep Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/40 to-background" />
        
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-24">
          <div className="max-w-[1440px] mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-5xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-solar-yellow/20 text-solar-yellow px-4 py-1 rounded-full text-xs font-bold uppercase tracking-[0.2em] backdrop-blur-md border border-solar-yellow/30">
                  {project.projectType}
                </span>
                <span className="text-on-surface/60 text-xs font-bold uppercase tracking-[0.2em]">
                  {project.location}
                </span>
              </div>
              
              <h1 className="text-5xl md:text-8xl font-headline-lg text-on-surface mb-8 uppercase tracking-tight leading-[0.9]">
                {project.name}
              </h1>
              
              <div className="flex flex-wrap gap-4 md:gap-10">
                <div className="flex flex-col">
                  <span className="text-solar-yellow text-3xl md:text-5xl font-headline-sm font-bold">{project.powerKwp} <small className="text-xl">kWp</small></span>
                  <span className="text-on-surface/40 text-xs uppercase tracking-widest mt-2">Potencia Instalada</span>
                </div>
                <div className="w-px h-16 bg-on-surface/10 hidden md:block"></div>
                <div className="flex flex-col">
                  <span className="text-on-surface text-3xl md:text-5xl font-headline-sm font-bold">{project.partnerCompany}</span>
                  <span className="text-on-surface/40 text-xs uppercase tracking-widest mt-2">Socio Estratégico</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Narrative - Premium Layout */}
      <section className="py-24 px-4 md:px-12 max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          
          {/* Left Column: Narrative */}
          <div className="lg:col-span-8 space-y-24">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <span className="absolute -left-4 md:-left-12 top-0 text-primary/10 text-8xl font-serif select-none italic" aria-hidden>
                &#8220;
              </span>
              <h2 className="text-sm font-bold text-primary uppercase tracking-[0.3em] mb-8">El Desafío y la Visión</h2>
              <p className="text-on-surface-variant text-xl md:text-2xl leading-relaxed font-light italic">
                {project.description}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glass p-8 md:p-10 rounded-3xl border border-white/5 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-6xl text-solar-yellow">eco</span>
                </div>
                <h3 className="text-xs font-bold text-on-surface/50 uppercase tracking-[0.3em] mb-6">Impacto Sostenible</h3>
                <p className="text-on-surface-variant leading-relaxed">
                  {project.impact}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glass p-8 md:p-10 rounded-3xl border border-white/5 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-6xl text-primary">bolt</span>
                </div>
                <h3 className="text-xs font-bold text-on-surface/50 uppercase tracking-[0.3em] mb-6">Ficha Técnica</h3>
                <div className="text-on-surface-variant leading-relaxed whitespace-pre-wrap font-mono text-sm">
                  {project.technicalSpecs}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Right Column: CTA & Sticky Details */}
          <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit space-y-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-surface-container-high p-8 rounded-3xl border border-primary/20 shadow-2xl energy-glow"
            >
              <h3 className="text-xl font-headline-sm text-on-surface mb-8 uppercase tracking-widest text-center">Inicie su Transición</h3>
              <p className="text-on-surface-variant text-center mb-8 text-sm">
                Inspirado en {project.name}, podemos diseñar una solución a medida para sus necesidades industriales o comerciales.
              </p>
              <Link
                href="/#contacto"
                className="block w-full bg-primary text-on-primary py-4 rounded-xl text-center font-bold uppercase tracking-[0.2em] text-xs hover:scale-[1.02] transition-all shadow-lg"
              >
                Solicitar Diagnóstico Técnico
              </Link>
              <p className="text-[10px] text-center mt-4 opacity-40 uppercase tracking-widest">Consultoría Premium SOLPOWER X</p>
            </motion.div>

            <div className="px-4 space-y-4">
              <h4 className="text-[10px] font-bold text-on-surface/30 uppercase tracking-[0.4em] mb-4">Metadata del Proyecto</h4>
              {[
                { label: "Categoría", value: project.projectType },
                { label: "Localidad", value: project.location },
                { label: "Eficiencia", value: "A+" },
                { label: "Estatus", value: "Operativo" }
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-[11px] uppercase tracking-widest text-on-surface/40">{item.label}</span>
                  <span className="text-sm font-medium text-on-surface/80">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Footer */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-[1440px] mx-auto px-4 md:px-12">
          <div className="flex justify-between items-center">
            <Link href="/#proyectos" className="flex items-center gap-3 text-on-surface/40 hover:text-primary transition-colors uppercase tracking-widest text-xs font-bold">
              <span className="material-symbols-outlined">arrow_back</span> Ver Portafolio
            </Link>
            <div className="h-px flex-grow mx-8 bg-gradient-to-r from-transparent via-on-surface/10 to-transparent"></div>
            <span className="text-primary text-[10px] uppercase tracking-[0.5em] font-bold">Solpower X Engineering</span>
          </div>
        </div>
      </section>
    </main>
  );
}
