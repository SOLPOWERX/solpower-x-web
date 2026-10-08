import type { Metadata } from "next";
import IngenieriaPagina from "@/components/nueva/IngenieriaPagina";
import SmoothScroll from "@/components/site/SmoothScroll";
import WhatsAppFloat from "@/components/site/WhatsAppFloat";

const title = "Ingeniería eléctrica y solar";
const description =
  "Diseño PVsyst, memorias RETIE y legalización de proyectos solares. Subestaciones, redes de media y baja tensión, instalaciones eléctricas, certificación RETIE y calidad de energía en Colombia.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/ingenieria" },
  openGraph: { url: "/ingenieria", title: `${title} | SOLPOWER X`, description },
};

export default function IngenieriaPage() {
  return (
    <>
      <SmoothScroll />
      <IngenieriaPagina />
      <WhatsAppFloat />
    </>
  );
}
