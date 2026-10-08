import type { Metadata } from "next";
import EmpresasPagina from "@/components/nueva/EmpresasPagina";
import SmoothScroll from "@/components/site/SmoothScroll";
import { faqsEmpresas } from "@/lib/empresas";

const title = "Energía solar para empresas en Bogotá";
const description =
  "Sistemas solares para industria, bodegas, comercio, hoteles y clínicas. Estudio de ahorro sin costo, beneficios de la Ley 1715, instalación y certificación RETIE.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/empresas" },
  openGraph: { url: "/empresas", title: `${title} | SOLPOWER X`, description },
};

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqsEmpresas.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

export default function EmpresasPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <SmoothScroll />
      <EmpresasPagina />
    </>
  );
}
