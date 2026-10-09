"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { site } from "@/lib/site";
import { ingenierias, ingenieriaNueva, solucionesNueva } from "@/lib/nueva";
import Logo from "@/components/site/Logo";
import { useIntroListo } from "./Intro";

type MegaKey = "solar" | "ingenieria";

const links: { href: string; label: string; corto?: string; mega?: MegaKey }[] = [
  { href: "/empresas", label: "Empresas" },
  { href: "/hogares", label: "Hogares" },
  { href: "/ingenieria", label: "Ingeniería", mega: "ingenieria" },
  { href: "#soluciones", label: "Soluciones", mega: "solar" },
  { href: "#ley-1715", label: "Beneficios Ley 1715", corto: "Ley 1715" },
  { href: "#nosotros", label: "Nosotros" },
  { href: "#contacto", label: "Contacto" },
];

type Mega = {
  kicker: string;
  title: string;
  body: string;
  cta: { href: string; label: string };
  /** Lista opcional en la columna izquierda (Ingeniería solar). */
  lista?: { title: string; body: string }[];
  itemsTitle?: string;
  items: { title: string; tag: string; image: string; href: string }[];
};

const mega: Record<MegaKey, Mega> = {
  solar: {
    kicker: "Soluciones",
    title: "Sistemas para cada necesidad",
    body: "Diseño RETIE, simulación PVsyst y análisis financiero en cada proyecto.",
    cta: { href: "#calculadora", label: "Calcular mi ahorro" },
    items: solucionesNueva.map((s) => ({ title: s.title, tag: s.tag, image: s.image, href: "#soluciones" })),
  },
  ingenieria: {
    kicker: "Ingeniería solar",
    title: "Para clientes e instaladores",
    body: "",
    cta: { href: "/ingenieria#solar", label: "Ver ingeniería solar" },
    lista: ingenierias[0].items,
    itemsTitle: "Servicios de ingeniería eléctrica",
    items: ingenieriaNueva.map((e, i) => ({ title: e.title, tag: `0${i + 1}`, image: e.image, href: "/ingenieria#electrica" })),
  },
};

const ease = [0.7, 0, 0.2, 1] as const;

/** Texto que rueda letra por letra al pasar el mouse. */
function Roll({ text, open }: { text: string; open?: boolean }) {
  return (
    <span className={`roll roll-claro ${open ? "is-open" : ""}`} aria-hidden>
      {text.split("").map((ch, i) => (
        <span key={i} style={{ ["--i" as string]: i }}>
          {ch === " " ? " " : ch}
        </span>
      ))}
    </span>
  );
}

/**
 * Menú principal. En la portada (`enInicio`) los enlaces son anclas y espera a la animación de entrada;
 * en las demás páginas los enlaces llevan a la sección de la portada.
 */
export default function HeaderNuevo({ enInicio = false }: { enInicio?: boolean }) {
  const ir = (h: string) => (h.startsWith("#") && !enInicio ? site.inicio + h : h);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const [menu, setMenu] = useState<MegaKey | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const lastY = useRef(0);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 25 });

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      // Se esconde al bajar y reaparece al subir
      setHidden(y > 300 && y > lastY.current + 4);
      if (y < lastY.current - 4 || y < 300) setHidden(false);
      if (Math.abs(y - lastY.current) > 4) setMenu(null);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Marca la sección que se está viendo
  useEffect(() => {
    const ids = links.map((l) => l.href.slice(1));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(`#${e.target.id}`);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    const hero = document.getElementById("inicio");
    const heroIo = new IntersectionObserver(([e]) => e.isIntersecting && setActive(null), { rootMargin: "-45% 0px -50% 0px" });
    if (hero) heroIo.observe(hero);
    return () => {
      io.disconnect();
      heroIo.disconnect();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openMenu = (k: MegaKey | null) => {
    clearTimeout(closeTimer.current);
    setMenu(k);
  };
  const scheduleClose = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMenu(null), 160);
  };

  const introLista = useIntroListo();
  const listo = !enInicio || introLista;
  const panel = menu ? mega[menu] : null;
  if (!listo) return null;

  return (
    <>
      {/* Fondo que oscurece la página cuando el menú grande está abierto */}
      <AnimatePresence>
        {menu && (
          <motion.div
            key="veil"
            className="fixed inset-0 z-40 hidden bg-azul-950/40 backdrop-blur-[6px] lg:block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            onClick={() => setMenu(null)}
          />
        )}
      </AnimatePresence>

      <motion.header
        className="fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-6 md:pt-5"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: hidden && !open ? -130 : 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
        onMouseLeave={scheduleClose}
        onMouseEnter={() => clearTimeout(closeTimer.current)}
      >
        <motion.nav
          className={`nav-ring mx-auto flex items-center gap-3 rounded-full bg-gradient-to-r py-2 pl-5 pr-2 text-azul backdrop-blur-2xl backdrop-saturate-150 transition-[max-width,box-shadow] duration-700 md:pl-6 xl:gap-6 ${
            scrolled
              ? "max-w-[76rem] from-[#e9effa]/90 via-white/85 to-[#fff3d6]/90 shadow-[0_18px_50px_-18px_rgba(4,15,38,.55)]"
              : "max-w-[80rem] from-[#e9effa]/75 via-white/65 to-[#fff3d6]/75 shadow-[0_12px_40px_-20px_rgba(4,15,38,.45)]"
          }`}
          initial={{ clipPath: "inset(0% 46% 0% 46% round 999px)" }}
          animate={{ clipPath: "inset(0% 0% 0% 0% round 999px)", transitionEnd: { clipPath: "none" } }}
          transition={{ duration: 1.1, delay: 0.15, ease }}
        >
          {/* Reflejo de luz que cruza el menú cada pocos segundos */}
          <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
            <motion.span
              className="absolute inset-y-0 w-1/4 -skew-x-12 bg-gradient-to-r from-transparent via-white/80 to-transparent"
              initial={{ left: "-30%" }}
              animate={{ left: ["-30%", "130%"] }}
              transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 4.5, ease: "easeInOut", delay: 2 }}
            />
          </span>

          <a href={enInicio ? "#inicio" : site.inicio} aria-label="SOLPOWER X, inicio" className="relative shrink-0">
            <Logo light={false} size={40} circulo={false} />
          </a>

          <ul className="hidden items-center text-[0.84rem] font-medium lg:flex xl:text-[0.875rem]" onMouseLeave={() => setHover(null)}>
            {links.map((l, i) => {
              const isActive = active === l.href;
              const isOpen = menu === l.mega && !!l.mega;
              return (
                <motion.li
                  key={l.href}
                  className="relative"
                  initial={{ opacity: 0, y: -14, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ delay: 0.75 + i * 0.07, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
                  onMouseEnter={() => {
                    setHover(l.href);
                    openMenu(l.mega ?? null);
                  }}
                >
                  {(hover === l.href || isOpen) && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-sol/15 ring-1 ring-inset ring-sol/40"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <a
                    href={ir(l.href)}
                    onFocus={() => openMenu(l.mega ?? null)}
                    onClick={() => setMenu(null)}
                    aria-haspopup={l.mega ? "true" : undefined}
                    aria-expanded={l.mega ? isOpen : undefined}
                    className={`group relative flex items-center gap-1.5 whitespace-nowrap px-2 py-2.5 transition-colors xl:px-3 duration-300 ${
                      isActive || isOpen ? "text-azul" : "text-azul/70"
                    }`}
                  >
                    <span className="sr-only">{l.label}</span>
                    {l.corto ? (
                      <>
                        <span className="lg:max-xl:hidden">
                          <Roll text={l.label} open={isOpen} />
                        </span>
                        <span className="hidden lg:max-xl:inline">
                          <Roll text={l.corto} open={isOpen} />
                        </span>
                      </>
                    ) : (
                      <Roll text={l.label} open={isOpen} />
                    )}
                    {l.mega && (
                      <motion.svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        aria-hidden
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.35 }}
                        className={isOpen ? "text-sol" : "text-azul/40"}
                      >
                        <path d="M2 3.5 5 6.5 8 3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                      </motion.svg>
                    )}
                  </a>
                  {isActive && (
                    <motion.span
                      layoutId="nav-dot"
                      className="absolute -bottom-0.5 left-1/2 h-[3px] w-5 -translate-x-1/2 rounded-full bg-sol shadow-[0_0_12px_2px_rgba(255,194,61,.8)]"
                      transition={{ type: "spring", stiffness: 300, damping: 28 }}
                    />
                  )}
                </motion.li>
              );
            })}
          </ul>

          <div className="relative ml-auto flex items-center gap-2">
            <motion.a
              href={`tel:${site.phoneRaw}`}
              aria-label={`Llamar al ${site.phone}`}
              className="hidden h-10 w-10 place-items-center rounded-full bg-azul/[.06] text-azul ring-1 ring-inset ring-azul/10 transition-colors hover:bg-azul/10 hover:text-sol 2xl:grid"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.05, type: "spring", stiffness: 220, damping: 16 }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path
                  d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.a>

            <motion.a
              href={ir("#contacto")}
              className="shine group hidden items-center gap-3 whitespace-nowrap rounded-full bg-gradient-to-r from-sol to-sol-claro py-1.5 pl-5 pr-1.5 text-sm font-semibold text-azul-950 shadow-[0_8px_30px_-8px_rgba(240,165,0,.9)] transition-shadow hover:shadow-[0_10px_40px_-6px_rgba(255,194,61,1)] sm:inline-flex"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.15, type: "spring", stiffness: 200, damping: 15 }}
            >
              <span className="lg:max-xl:hidden">Cotizar proyecto</span>
              <span className="hidden lg:max-xl:inline">Cotizar</span>
              <span className="relative grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-azul-950 text-sol-claro">
                {[0, 1].map((k) => (
                  <svg
                    key={k}
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    aria-hidden
                    className={`absolute transition-transform duration-500 ease-[cubic-bezier(.7,0,.2,1)] ${
                      k ? "-translate-x-6 group-hover:translate-x-0" : "group-hover:translate-x-6"
                    }`}
                  >
                    <path d="M2 7h10M8 3l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ))}
              </span>
            </motion.a>

            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Abrir menú"
              className="group flex h-10 items-center gap-2.5 rounded-full bg-azul/[.06] pl-4 pr-3 text-sm font-semibold text-azul ring-1 ring-inset ring-azul/10 transition-colors hover:bg-azul/10 lg:hidden"
            >
              Menú
              <span className="flex w-5 flex-col items-end gap-[5px]" aria-hidden>
                <span className="h-[2px] w-5 rounded-full bg-sol transition-all duration-300 group-hover:w-3" />
                <span className="h-[2px] w-3 rounded-full bg-azul transition-all duration-300 group-hover:w-5" />
              </span>
            </button>
          </div>

          {/* Línea de progreso de lectura */}
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-x-8 bottom-0 h-[2px] origin-left rounded-full bg-gradient-to-r from-sol via-sol-claro to-[#fff3cf]"
            style={{ scaleX: progress, opacity: scrolled ? 1 : 0 }}
          />
        </motion.nav>

        {/* Menú grande (estilo Tesla / Apple) */}
        <AnimatePresence mode="wait">
          {panel && (
            <motion.div
              key={menu}
              className={`mx-auto mt-3 hidden overflow-hidden ${scrolled ? "max-w-[76rem]" : "max-w-[80rem]"} rounded-[28px] border border-white/10 bg-azul-950/90 text-white shadow-[0_40px_90px_-30px_rgba(4,15,38,.9)] backdrop-blur-2xl lg:block`}
              initial={{ opacity: 0, y: -14, clipPath: "inset(0% 0% 100% 0% round 28px)" }}
              animate={{ opacity: 1, y: 0, clipPath: "inset(0% 0% 0% 0% round 28px)" }}
              exit={{ opacity: 0, y: -10, clipPath: "inset(0% 0% 100% 0% round 28px)" }}
              transition={{ duration: 0.5, ease }}
              onMouseEnter={() => clearTimeout(closeTimer.current)}
            >
              <div className={`grid gap-6 p-6 ${panel.lista ? "grid-cols-[19rem_1fr]" : "grid-cols-[15rem_1fr]"}`}>
                <motion.div
                  className={`flex flex-col justify-between rounded-[20px] p-4 ${
                    panel.lista
                      ? "bg-[radial-gradient(circle_at_20%_0%,rgba(240,165,0,.3),transparent_70%)] ring-1 ring-inset ring-sol/25"
                      : "bg-[radial-gradient(circle_at_20%_0%,rgba(240,165,0,.25),transparent_60%)]"
                  }`}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15, duration: 0.5 }}
                >
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sol-claro">{panel.kicker}</p>
                    <p className="mt-3 text-2xl font-bold leading-tight">{panel.title}</p>
                    {panel.body && <p className="mt-3 text-sm leading-relaxed text-white/65">{panel.body}</p>}
                    {panel.lista && (
                      <ul className="mt-4 space-y-1">
                        {panel.lista.map((l) => (
                          <li key={l.title}>
                            <a
                              href={ir(panel.cta.href)}
                              onClick={() => setMenu(null)}
                              className="block rounded-xl px-2 py-1.5 transition-colors hover:bg-white/[.07]"
                            >
                              <span className="block text-sm font-semibold">{l.title}</span>
                              <span className="block text-xs text-white/55">{l.body}</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <a
                    href={ir(panel.cta.href)}
                    onClick={() => setMenu(null)}
                    className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold text-sol-claro"
                  >
                    {panel.cta.label}
                    <span className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
                  </a>
                </motion.div>

                <div>
                {panel.itemsTitle && (
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-sol-claro">{panel.itemsTitle}</p>
                )}
                <ul className="grid grid-cols-5 gap-3">
                  {panel.items.map((it, i) => (
                    <motion.li
                      key={it.title}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.12 + i * 0.06, duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
                    >
                      <a
                        href={ir(it.href)}
                        onClick={() => setMenu(null)}
                        className="group relative block h-56 overflow-hidden rounded-[18px] ring-1 ring-inset ring-white/10"
                      >
                        <Image
                          src={it.image}
                          unoptimized={it.image.endsWith(".svg")}
                          alt=""
                          fill
                          sizes="200px"
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <span className="absolute inset-0 bg-gradient-to-t from-azul-950 via-azul-950/30 to-transparent transition-opacity duration-500 group-hover:opacity-80" />
                        <span className="absolute inset-x-0 bottom-0 p-3.5">
                          <span className="block text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-sol-claro">{it.tag}</span>
                          <span className="mt-1 block text-sm font-semibold leading-snug">{it.title}</span>
                        </span>
                        <span className="absolute right-3 top-3 grid h-7 w-7 -translate-y-2 place-items-center rounded-full bg-sol text-xs text-azul-950 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                          ↗
                        </span>
                      </a>
                    </motion.li>
                  ))}
                </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {open && (
            <motion.div
              className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-azul-950/95 p-6 text-white backdrop-blur-xl lg:hidden"
              initial={{ clipPath: "circle(0% at 95% 4%)" }}
              animate={{ clipPath: "circle(150% at 95% 4%)" }}
              exit={{ clipPath: "circle(0% at 95% 4%)" }}
              transition={{ duration: 0.6, ease }}
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
                {links.map((l, i) => (
                  <motion.li
                    key={l.href}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.06 }}
                  >
                    <a href={ir(l.href)} onClick={() => setOpen(false)} className="flex items-baseline gap-4 py-1.5 text-3xl font-semibold">
                      <span className="text-sm font-medium text-sol">0{i + 1}</span>
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
    </>
  );
}
