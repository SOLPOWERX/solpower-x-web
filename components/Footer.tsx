import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-surface-container-lowest w-full py-12 border-t border-on-surface-variant/5">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 px-4 md:px-12 max-w-[1440px] mx-auto">
        <div className="md:col-span-1">
          <a href="/" className="flex items-center mb-6 gap-0 hover:opacity-80 transition-opacity">
            <Image
              src="/log.png"
              alt="Logo SOLPOWER X"
              width={80}
              height={80}
              className="object-contain"
              style={{ transform: "translateY(0%)" }}
            />
            <span className="font-headline-sm font-bold text-on-surface uppercase tracking-widest leading-none" style={{ marginLeft: "-0.75rem" }}>SOLPOWER X</span>
          </a>
          <p className="text-on-surface-variant text-sm">
            Liderando la transición energética con ingeniería de precisión en Colombia.
          </p>
        </div>
        <div>
          <h5 className="text-on-surface font-bold mb-4 uppercase text-xs tracking-widest">Servicios</h5>
          <ul className="space-y-2">
            <li><a className="text-on-surface-variant hover:text-primary transition-colors text-sm" href="/#solar">Solar Fotovoltaica</a></li>
            <li><a className="text-on-surface-variant hover:text-primary transition-colors text-sm" href="/#solar">Sistemas Híbridos</a></li>
            <li><a className="text-on-surface-variant hover:text-primary transition-colors text-sm" href="/#engineering">Auditoría Energética</a></li>
            <li><a className="text-on-surface-variant hover:text-primary transition-colors text-sm" href="/#engineering">Ingeniería Eléctrica</a></li>
          </ul>
        </div>
        <div>
          <h5 className="text-on-surface font-bold mb-4 uppercase text-xs tracking-widest">Compañía</h5>
          <ul className="space-y-2">
            <li><a className="text-on-surface-variant hover:text-primary transition-colors text-sm" href="#">Sostenibilidad</a></li>
            <li><a className="text-on-surface-variant hover:text-primary transition-colors text-sm" href="#">Servicios Técnicos</a></li>
            <li><a className="text-on-surface-variant hover:text-primary transition-colors text-sm" href="#">Privacidad</a></li>
          </ul>
        </div>
        <div>
          <h5 className="text-on-surface font-bold mb-4 uppercase text-xs tracking-widest">Legal / Normativa</h5>
          <p className="text-on-surface-variant text-xs mb-4 italic">Operamos bajo los estándares del Reglamento Técnico de Instalaciones Eléctricas (RETIE).</p>
          <div className="flex border-b border-primary/30">
            <input className="bg-transparent border-none text-on-surface placeholder:text-on-surface-variant/50 focus:ring-0 text-sm py-2 w-full focus:outline-none" placeholder="Su email para boletín..." type="email" />
            <button className="text-primary"><span className="material-symbols-outlined mt-1">send</span></button>
          </div>
        </div>
      </div>
      <div className="mt-12 pt-8 border-t border-on-surface-variant/5 text-center px-4">
        <a href="/" className="flex flex-col items-center gap-1 md:flex-row md:justify-center md:gap-2 hover:opacity-80 transition-opacity">
          <Image
            src="/log.png"
            alt="Logo SOLPOWER X"
            width={48}
            height={48}
            className="object-contain"
            style={{ transform: "translateY(0%)" }}
          />
          <p className="text-on-surface-variant text-xs opacity-60 max-w-xl md:max-w-2xl">
            © {new Date().getFullYear()} SOLPOWER X. Ingeniería y Sincronización de Energía. Todos los derechos reservados.
          </p>
        </a>
      </div>
    </footer>
  );
}
