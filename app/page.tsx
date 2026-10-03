import Header from "@/components/site/Header";
import Hero from "@/components/site/Hero";
import Manifesto from "@/components/site/Manifesto";
import Solutions from "@/components/site/Solutions";
import Analysis from "@/components/site/Analysis";
import Process from "@/components/site/Process";
import Engineering from "@/components/site/Engineering";
import Clients from "@/components/site/Clients";
import Trust from "@/components/site/Trust";
import Faq from "@/components/site/Faq";
import Contact from "@/components/site/Contact";
import Footer from "@/components/site/Footer";
import WhatsAppFloat from "@/components/site/WhatsAppFloat";
import SmoothScroll from "@/components/site/SmoothScroll";

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <Header />
      <main>
        <Hero />
        <Manifesto />
        <Solutions />
        <Analysis />
        <Process />
        <Engineering />
        <Clients />
        <Trust />
        <Faq />
        <Contact />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
