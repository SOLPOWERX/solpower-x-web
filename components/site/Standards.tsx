import Image from "next/image";
import { site } from "@/lib/site";

const norms = [
  { code: "RETIE 2024", body: "Reglamento técnico de instalaciones eléctricas de Colombia." },
  { code: "NTC 2050", body: "Código eléctrico colombiano para instalaciones internas." },
  { code: "IEEE 80", body: "Diseño de mallas de puesta a tierra en subestaciones." },
  { code: "IEC", body: "Normas internacionales para equipos y sistemas fotovoltaicos." },
];

export default function Standards() {
  return (
    <section className="border-t border-linea/30 bg-white py-24 md:py-32">
      <div className="mx-auto grid max-w-6xl gap-16 px-4 md:grid-cols-2 md:px-8">
        <div>
          <h2 className="display text-[clamp(2.2rem,5vw,4rem)] text-azul">Quién firma tus diseños</h2>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-tinta/75">
            {site.engineer}, ingeniero electricista. Cada memoria y cada plano lleva su firma y su matrícula
            profesional, y él responde por ellos ante el inspector y el operador de red.
          </p>
          <div className="mt-10 flex items-center gap-5">
            <Image src="/isotipo.png" alt="" width={72} height={63} />
            <p className="max-w-xs text-tinta/75">
              <span className="wide block font-bold text-azul">SOLPOWER X</span>
              {site.slogan}.
            </p>
          </div>
        </div>

        <div>
          <h3 className="wide mb-6 font-bold text-azul">Normas con las que trabajamos</h3>
          <dl className="divide-y divide-linea/30 border-y border-linea/30">
            {norms.map((n) => (
              <div key={n.code} className="grid grid-cols-[8.5rem_1fr] gap-4 py-5">
                <dt className="wide font-bold text-tinta">{n.code}</dt>
                <dd className="text-tinta/75">{n.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
