"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { site } from "@/lib/site";
import Logo from "./Logo";

const links = [
  { href: "#soluciones", label: "Energía solar" },
  { href: "#analisis", label: "Análisis financiero" },
  { href: "#ingenieria", label: "Ingeniería" },
  { href: "#clientes", label: "Clientes" },
  { href: "#preguntas", label: "Preguntas" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      // Se esconde al bajar y reaparece al subir
      setHidden(y > 300 && y > lastY.current + 4);
      if (y < lastY.current - 4 || y < 300) setHidden(false);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-6 md:pt-5"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: hidden && !open ? -110 : 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <nav
        className={`mx-auto flex max-w-6xl items-center justify-between rounded-full px-3 py-2 transition-all duration-500 md:px-4 ${
          scrolled
            ? "bg-white/90 shadow-[0_10px_40px_-15px_rgba(13,43,94,.35)] backdrop-blur-xl"
            : "bg-white/15 backdrop-blur-md"
        }`}
      >
        <a href="#inicio" aria-label="SOLPOWER X, inicio">
          <Logo light={!scrolled} />
        </a>

        <ul
          className={`hidden items-center text-sm font-medium lg:flex ${scrolled ? "text-tinta" : "text-white"}`}
          onMouseLeave={() => setHover(null)}
        >
          {links.map((l, i) => (
            <motion.li
              key={l.href}
              className="relative"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.07, duration: 0.5 }}
              onMouseEnter={() => setHover(l.href)}
            >
              {hover === l.href && (
                <motion.span
                  layoutId="nav-pill"
                  className={`absolute inset-0 rounded-full ${scrolled ? "bg-azul/[.07]" : "bg-white/20"}`}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <a href={l.href} className="relative block px-4 py-2 transition-colors hover:text-sol">
                {l.label}
              </a>
            </motion.li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <motion.a
            href="#contacto"
            className="btn-sol shine hidden !px-5 !py-2.5 text-sm sm:inline-flex"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9, type: "spring", stiffness: 200, damping: 15 }}
          >
            Cotizar proyecto
          </motion.a>
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
            <div className="flex items-center justify-between">
              <Logo />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar menú"
                className="grid h-11 w-11 place-items-center rounded-full bg-white/10"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <ul className="mt-10 space-y-2">
              {[...links, { href: "#contacto", label: "Contacto" }].map((l, i) => (
                <motion.li
                  key={l.href}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
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
              className="btn-sol shine mt-auto"
            >
              Escribir por WhatsApp
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
