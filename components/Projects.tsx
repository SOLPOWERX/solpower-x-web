import prisma from "@/lib/prisma";
import ProjectsClient from "./ProjectsClient";

export default async function Projects() {
  const projects = await prisma.project.findMany({
    where: { visible: true },
    orderBy: { displayOrder: "asc" },
    take: 2, // Mostrar solo los primeros 2 proyectos
  });

  if (projects.length === 0) {
    return null; // No mostrar sección si no hay proyectos
  }

  return (
    <section className="py-24 px-4 md:px-12 max-w-[1440px] mx-auto" id="proyectos">
      <h2 className="font-headline-lg text-4xl text-on-surface mb-12 text-center uppercase tracking-widest">Nuestra Huella Energética</h2>
      <ProjectsClient projects={projects} />
    </section>
  );
}
