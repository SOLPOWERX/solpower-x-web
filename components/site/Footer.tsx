import Image from "next/image";
import { site } from "@/lib/site";

const cols = [
  {
    title: "Energía solar",
    links: [
      { href: "#on-grid", label: "Sistemas on-grid" },
      { href: "#off-grid", label: "Sistemas off-grid" },
      { href: "#hibridos", label: "Sistemas híbridos" },
      { href: "#bess", label: "BESS a gran escala" },
      { href: "#analisis", label: "Análisis técnico-financiero" },
    ],
  },
  {
    title: "Ingeniería",
    links: [
      { href: "#ingenieria", label: "Redes de media y baja tensión" },
      { href: "#ingenieria", label: "Subestaciones eléctricas" },
      { href: "#ingenieria", label: "Certificación RETIE" },
      { href: "#ingenieria", label: "Calidad de energía" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-azul-950 pt-20 text-white/70">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <a href="#inicio" className="flex items-center gap-3 text-white">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-white p-1.5">
              <Image src="/isotipo.png" alt="" width={38} height={33} />
            </span>
            <span className="text-xl font-bold">
              SOLPOWER <span className="text-sol">X</span>
            </span>
          </a>
          <p className="mt-5 max-w-xs leading-relaxed">
            {site.slogan}. Liderando la transición energética con ingeniería de precisión en Colombia.
          </p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h3 className="mb-5 font-semibold text-white">{c.title}</h3>
            <ul className="space-y-3 text-sm">
              {c.links.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="transition-colors hover:text-sol">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <h3 className="mb-5 font-semibold text-white">Contacto</h3>
          <ul className="space-y-3 text-sm">
            <li>
              <a href={`${site.whatsapp}un%20proyecto`} target="_blank" rel="noopener noreferrer" className="hover:text-sol">
                {site.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="hover:text-sol">
                {site.email}
              </a>
            </li>
            <li>Toda Colombia</li>
          </ul>
          <p className="mt-6 text-sm leading-relaxed">
            Operamos bajo el Reglamento Técnico de Instalaciones Eléctricas (RETIE) y la NTC 2050.
          </p>
        </div>
      </div>
      <div className="mx-auto mt-16 flex max-w-6xl flex-col gap-3 border-t border-white/10 px-5 py-8 text-sm md:flex-row md:justify-between">
        <p>© {new Date().getFullYear()} SOLPOWER X. Todos los derechos reservados.</p>
        <p>Ingeniería eléctrica y energía solar en Colombia.</p>
      </div>
    </footer>
  );
}
