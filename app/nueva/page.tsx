import type { Metadata } from "next";
import Intro from "@/components/nueva/Intro";
import HeaderNuevo from "@/components/nueva/HeaderNuevo";
import HeroEscena from "@/components/nueva/HeroEscena";
import Puertas from "@/components/nueva/Puertas";
import Buscador from "@/components/nueva/Buscador";
import IngenieriaDos from "@/components/nueva/IngenieriaDos";
import Ley1715 from "@/components/nueva/Ley1715";
import Nosotros from "@/components/nueva/Nosotros";
import Cierre from "@/components/nueva/Cierre";
import Manifesto from "@/components/site/Manifesto";
import Analysis from "@/components/site/Analysis";
import Solutions from "@/components/site/Solutions";
import Clients from "@/components/site/Clients";
import Faq from "@/components/site/Faq";
import Contact from "@/components/site/Contact";
import Footer from "@/components/site/Footer";
import WhatsAppFloat from "@/components/site/WhatsAppFloat";
import SmoothScroll from "@/components/site/SmoothScroll";
import VolverArriba from "@/components/nueva/VolverArriba";
import { imagenContacto, solucionesNueva } from "@/lib/nueva";

/** Portada de PRUEBA. No reemplaza la página principal; no se indexa en Google. */
export const metadata: Metadata = {
  title: "Portada nueva (prueba)",
  robots: { index: false, follow: false },
};

export default function NuevaPortada() {
  return (
    <>
      <Intro />
      <SmoothScroll />
      <HeaderNuevo enInicio />
      <main>
        <HeroEscena />
        <Puertas />
        <Buscador />
        <Manifesto />
        <Analysis />
        <Solutions items={solucionesNueva} />
        <IngenieriaDos />
        <Clients />
        <Ley1715 />
        <Nosotros />
        <Faq />
        <Cierre />
        <Contact imagen={imagenContacto} />
      </main>
      <Footer />
      <WhatsAppFloat />
      <VolverArriba />
    </>
  );
}
