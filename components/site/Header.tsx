"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { site } from "@/lib/site";

const links = [
  { href: "#soluciones", label: "Energía solar" },
  { href: "#analisis", label: "Análisis financiero" },
  { href: "#ingenieria", label: "Ingeniería" },
  { href: "#preguntas", label: "Preguntas" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-6 md:pt-5">
      <nav
        className={`mx-auto flex max-w-6xl items-center justify-between rounded-full px-3 py-2 transition-all duration-500 md:px-4 ${
          scrolled
            ? "bg-white/90 shadow-[0_10px_40px_-15px_rgba(13,43,94,.35)] backdrop-blur-xl"
            : "bg-white/15 backdrop-blur-md"
        }`}
      >
        <a href="#inicio" className="flex items-center gap-2.5" aria-label="SOLPOWER X, inicio">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-white p-1.5 shadow-sm">
            <Image src="/isotipo.png" alt="" width={32} height={28} priority />
          </span>
          <span
            className={`whitespace-nowrap text-lg font-bold tracking-tight transition-colors ${
              scrolled ? "text-azul" : "text-white"
            }`}
          >
            SOLPOWER <span className="text-sol">X</span>
          </span>
        </a>

        <ul
          className={`hidden items-center gap-7 text-sm font-medium lg:flex ${scrolled ? "text-tinta" : "text-white"}`}
        >
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="relative py-1 transition-colors hover:text-sol">
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <a href="#contacto" className="btn-sol hidden !px-5 !py-2.5 text-sm sm:inline-flex">
            Cotizar proyecto
          </a>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Abrir menú"
            className={`grid h-10 w-10 place-items-center rounded-full lg:hidden ${
              scrolled ? "bg-azul text-white" : "bg-white text-azul"
            }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
              <path d="M4 7h16M4 12h16M4 17h10" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col bg-azul-950/95 p-6 text-white backdrop-blur-xl lg:hidden"
            initial={{ clipPath: "circle(0% at 95% 4%)" }}
            animate={{ clipPath: "circle(150% at 95% 4%)" }}
            exit={{ clipPath: "circle(0% at 95% 4%)" }}
            transition={{ duration: 0.6, ease: [0.7, 0, 0.2, 1] }}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar menú"
              className="ml-auto grid h-11 w-11 place-items-center rounded-full bg-white/10"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>
            <ul className="mt-10 space-y-2">
              {[...links, { href: "#contacto", label: "Contacto" }].map((l, i) => (
                <motion.li
                  key={l.href}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.06 }}
                >
                  <a href={l.href} onClick={() => setOpen(false)} className="block py-2 text-4xl font-semibold">
                    {l.label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <a
              href={`${site.whatsapp}un%20proyecto`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-sol mt-auto"
            >
              Escribir por WhatsApp
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
