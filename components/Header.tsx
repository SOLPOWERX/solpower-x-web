"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl dark:bg-surface/80 border-b border-on-surface-variant/10 shadow-sm py-3 md:py-5">
      <div className="flex justify-between items-center px-3 md:px-8 lg:px-12 max-w-[1440px] mx-auto">
        <Link href="/" className="flex items-center gap-2 md:gap-4 min-w-0 hover:opacity-80 transition-opacity">
          <Image
            src="/log.png"
            alt="Logo SOLPOWER X"
            width={48}
            height={48}
            className="object-contain w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 flex-shrink-0"
            style={{ transform: "translateY(0%)" }}
          />
          <span className="font-headline-sm text-sm md:text-xl lg:text-3xl text-on-surface uppercase tracking-tighter truncate">SOLPOWER X</span>
        </Link>
        
        <div className="hidden md:flex gap-4 lg:gap-8 items-center">
          <Link className="font-headline-sm text-xs lg:text-sm text-on-surface-variant hover:text-primary transition-colors duration-300 uppercase tracking-widest" href="/#solar">Energía Solar</Link>
          <Link className="font-headline-sm text-xs lg:text-sm text-on-surface-variant hover:text-primary transition-colors duration-300 uppercase tracking-widest" href="/#engineering">Ingeniería</Link>
          <Link className="font-headline-sm text-xs lg:text-sm text-on-surface-variant hover:text-primary transition-colors duration-300 uppercase tracking-widest" href="/#tecnologias">Tecnologías</Link>
          <Link className="font-headline-sm text-xs lg:text-sm text-on-surface-variant hover:text-primary transition-colors duration-300 uppercase tracking-widest" href="/#contacto">Contacto</Link>
          <Link href="/#contacto" className="bg-secondary-container text-on-secondary-container px-4 md:px-5 lg:px-6 py-2 rounded-full font-label-md text-xs lg:text-sm hover:scale-105 transition-transform duration-200 uppercase tracking-wider whitespace-nowrap">
            Solicitar Cotización
          </Link>
        </div>

        <button 
          className="md:hidden text-on-surface p-2 flex-shrink-0"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span className="material-symbols-outlined text-2xl md:text-3xl">{isMenuOpen ? "close" : "menu"}</span>
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-24 left-0 w-full bg-surface border-b border-on-surface-variant/10 shadow-lg p-4 flex flex-col gap-4 md:hidden"
          >
            <Link onClick={() => setIsMenuOpen(false)} className="p-4 text-on-surface hover:bg-surface-variant rounded-lg uppercase tracking-widest text-sm" href="/#solar">Energía Solar</Link>
            <Link onClick={() => setIsMenuOpen(false)} className="p-4 text-on-surface hover:bg-surface-variant rounded-lg uppercase tracking-widest text-sm" href="/#engineering">Ingeniería</Link>
            <Link onClick={() => setIsMenuOpen(false)} className="p-4 text-on-surface hover:bg-surface-variant rounded-lg uppercase tracking-widest text-sm" href="/#tecnologias">Tecnologías</Link>
            <Link onClick={() => setIsMenuOpen(false)} className="p-4 text-on-surface hover:bg-surface-variant rounded-lg uppercase tracking-widest text-sm" href="/#contacto">Contacto</Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
