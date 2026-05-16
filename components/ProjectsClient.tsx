"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface ProjectData {
  id: string;
  name: string;
  projectType: string;
  location: string;
  powerKwp: number;
  imageUrl: string;
}

export default function ProjectsClient({ projects }: { projects: ProjectData[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[600px]">
      {projects.map((project, index) => (
        <motion.div
          key={project.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.2 }}
          className={`relative rounded-2xl overflow-hidden group cursor-pointer ${
            index === 0 ? "md:col-span-8" : "md:col-span-4"
          }`}
        >
          <Link href={`/projects/${project.id}`}>
            <img
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              alt={project.name}
              src={project.imageUrl}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent p-8 flex flex-col justify-end group-hover:from-background/95 transition-all duration-300">
              <span className="text-solar-yellow text-xs font-bold uppercase tracking-widest mb-2">
                {project.projectType} - {project.location}
              </span>
              <h3 className="text-2xl font-headline-sm text-on-surface group-hover:text-solar-yellow transition-colors">
                {project.name} ({project.powerKwp}kWp)
              </h3>
              <p className="text-on-surface-variant text-sm mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                Ver detalles del proyecto →
              </p>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
