"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { site } from "@/lib/site";

const links = [
  { href: "#servicios", label: "Servicios" },
  { href: "#proceso", label: "Cómo trabajamos" },
  { href: "#contacto", label: "Contacto" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled ? "bg-noche/85 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-4 md:px-8">
        <a href="#inicio" className="flex items-center gap-3 text-white" aria-label="SOLPOWER X, inicio">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-white p-1">
            <Image src="/isotipo.png" alt="" width={36} height={31} priority />
          </span>
          <span className="wide whitespace-nowrap text-lg font-bold tracking-tight">SOLPOWER X</span>
        </a>

        <ul className="hidden items-center gap-8 text-sm text-niebla md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="transition-colors hover:text-white">
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href={`${site.whatsapp}un%20proyecto`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-sol px-4 py-2 text-sm font-semibold text-noche transition-colors hover:bg-sol-claro"
        >
          <span className="hidden sm:inline">Escribir por </span>WhatsApp
        </a>
      </nav>
    </header>
  );
}
