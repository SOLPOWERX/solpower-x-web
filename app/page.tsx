import prisma from "@/lib/prisma";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Technologies from "@/components/Technologies";
import Experience from "@/components/Experience";
import Projects from "@/components/Projects";
import Testimonials from "@/components/Testimonials";
import Clients from "@/components/Clients";
import ContactForm from "@/components/ContactForm";
import WhatsAppButton from "@/components/WhatsAppButton";
import Footer from "@/components/Footer";

// Revalidate page dynamically or set a revalidation time
export const revalidate = 0; // Dynamic rendering to always show current section state

const defaultSections = [
  { name: "hero", status: "visible" },
  { name: "services", status: "visible" },
  { name: "technologies", status: "visible" },
  { name: "contact", status: "visible" },
  { name: "experience", status: "hidden" },
  { name: "projects", status: "hidden" },
  { name: "testimonials", status: "hidden" },
  { name: "clients", status: "hidden" },
];

async function ensureSectionStates() {
  const count = await prisma.sectionState.count();

  if (count > 0) {
    return;
  }

  await Promise.all(
    defaultSections.map((section) =>
      prisma.sectionState.create({
        data: section,
      }),
    ),
  );
}

async function ensureDefaultStatistics() {
  const count = await prisma.statistic.count();
  if (count > 0) {
    return;
  }

  const defaultStats = [
    { name: "average_savings", value: "35%", subtext: "Ahorro Promedio", visible: true, displayOrder: 0 },
    { name: "energy_generated", value: "500+", subtext: "MWh Generados", visible: true, displayOrder: 1 },
  ];

  await Promise.all(
    defaultStats.map((stat) =>
      prisma.statistic.create({ data: stat }),
    ),
  );
}

export default async function Home() {
  await ensureSectionStates();
  await ensureDefaultStatistics();

  // Fetch all section states directly from DB
  const sections = await prisma.sectionState.findMany();
  const stats = await prisma.statistic.findMany({ orderBy: { displayOrder: "asc" } });
  
  // Helper function to check if a section is visible
  const isVisible = (name: string) => {
    const section = sections.find((s: { name: string; status: string }) => s.name === name);
    return section?.status === "visible";
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {isVisible("hero") && <Hero stats={stats} />}
        {isVisible("services") && <Services />}
        {isVisible("technologies") && <Technologies />}
        {isVisible("experience") && <Experience />}
        {isVisible("projects") && <Projects />}
        {isVisible("testimonials") && <Testimonials />}
        {isVisible("clients") && <Clients />}
        {isVisible("contact") && <ContactForm />}
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
