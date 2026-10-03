import Header from "@/components/site/Header";
import Hero from "@/components/site/Hero";
import EnergyPath from "@/components/site/EnergyPath";
import Process from "@/components/site/Process";
import Standards from "@/components/site/Standards";
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
        <EnergyPath />
        <Process />
        <Standards />
        <Contact />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
