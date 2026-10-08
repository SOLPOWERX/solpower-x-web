import type { Metadata } from "next";
import HogaresPagina from "@/components/nueva/HogaresPagina";
import SmoothScroll from "@/components/site/SmoothScroll";
import { faqsHogar } from "@/lib/hogares";

const title = "Energía solar para su hogar";
const description =
  "Paneles solares para casas, fincas y conjuntos en Colombia. Ahorro en la factura, baterías para no quedarse sin luz, instalación y certificación RETIE.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/hogares" },
  openGraph: { url: "/hogares", title: `${title} | SOLPOWER X`, description },
};

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqsHogar.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

export default function HogaresPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <SmoothScroll />
      <HogaresPagina />
    </>
  );
}
