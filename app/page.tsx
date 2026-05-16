import { getPrisma } from "@/lib/prisma";
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

// Force dynamic rendering and avoid build-time DB fetching
export const dynamic = "force-dynamic";
export const revalidate = 0;

const defaultSections = [
  { name: "hero", status: "visible" as const },
  { name: "services", status: "visible" as const },
  { name: "technologies", status: "visible" as const },
  { name: "contact", status: "visible" as const },
  { name: "experience", status: "hidden" as const },
  { name: "projects", status: "hidden" as const },
  { name: "testimonials", status: "hidden" as const },
  { name: "clients", status: "hidden" as const },
];

/** Datos mínimos para el Hero si la BD no está disponible (misma forma que Prisma). */
const FALLBACK_STATS = [
  {
    id: "fallback-average_savings",
    name: "average_savings",
    value: "35%",
    subtext: "Ahorro Promedio",
    visible: true,
    displayOrder: 0,
  },
  {
    id: "fallback-energy_generated",
    name: "energy_generated",
    value: "500+",
    subtext: "MWh Generados",
    visible: true,
    displayOrder: 1,
  },
];

type SectionRow = { name: string; status: string };

async function loadHomeFromDatabase(): Promise<{
  sections: SectionRow[];
  stats: typeof FALLBACK_STATS;
}> {
  const prisma = await getPrisma();

  const sectionCount = await prisma.sectionState.count();
  if (sectionCount === 0) {
    await Promise.all(
      defaultSections.map((section) =>
        prisma.sectionState.create({
          data: { name: section.name, status: section.status },
        }),
      ),
    );
  }

  const statCount = await prisma.statistic.count();
  if (statCount === 0) {
    const defaultStats = [
      { name: "average_savings", value: "35%", subtext: "Ahorro Promedio", visible: true, displayOrder: 0 },
      { name: "energy_generated", value: "500+", subtext: "MWh Generados", visible: true, displayOrder: 1 },
    ];
    await Promise.all(
      defaultStats.map((stat) => prisma.statistic.create({ data: stat })),
    );
  }

  const sections = await prisma.sectionState.findMany();
  const stats = await prisma.statistic.findMany({ orderBy: { displayOrder: "asc" } });

  return { sections, stats };
}

export default async function Home() {
  let sections: SectionRow[] = defaultSections.map((s) => ({ name: s.name, status: s.status }));
  let stats = FALLBACK_STATS;

  try {
    const loaded = await loadHomeFromDatabase();
    sections = loaded.sections;
    stats = loaded.stats;
  } catch (err) {
    console.error("[home] Base de datos no disponible; usando contenido por defecto.", err);
  }

  const isVisible = (name: string) => {
    const section = sections.find((s) => s.name === name);
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
