import { site } from "@/lib/site";

export default function Hero() {
  return (
    <section id="inicio" className="blueprint relative overflow-hidden bg-noche text-white">
      <div className="mx-auto flex min-h-[88svh] max-w-6xl flex-col justify-end px-4 pb-16 pt-32 md:px-8 md:pb-24">
        <p className="hero-in mb-6 max-w-md text-niebla">
          Ingeniería eléctrica en Colombia, firmada por {site.engineer}, ingeniero electricista.
        </p>
        <h1 className="hero-in display max-w-5xl text-[clamp(2.6rem,8vw,6.5rem)]">
          Del sol al tablero, con diseño listo para certificar.
        </h1>
        <p className="hero-in mt-8 max-w-xl text-lg leading-relaxed text-niebla">
          Memorias de cálculo RETIE, sistemas solares on-grid y off-grid, subestaciones y redes de media y baja tensión.
        </p>
        <div className="hero-in mt-10 flex flex-wrap gap-4">
          <a
            href={`${site.whatsapp}un%20proyecto`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-sol px-6 py-3 font-semibold text-noche transition-colors hover:bg-sol-claro"
          >
            Cotizar por WhatsApp
          </a>
          <a
            href="#servicios"
            className="rounded-full border border-linea/50 px-6 py-3 font-semibold text-white transition-colors hover:border-white"
          >
            Ver servicios
          </a>
        </div>
      </div>
    </section>
  );
}
