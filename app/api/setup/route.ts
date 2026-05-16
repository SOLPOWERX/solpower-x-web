import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const adminCount = await prisma.adminUser.count();
    
    if (adminCount === 0) {
      // Create default admin
      const hashedPassword = await bcrypt.hash("solpower2024", 10);
      await prisma.adminUser.create({
        data: {
          username: "admin",
          password: hashedPassword,
        },
      });
    }

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

    for (const section of defaultSections) {
      const exists = await prisma.sectionState.findUnique({
        where: { name: section.name }
      });

      if (!exists) {
        await prisma.sectionState.create({
          data: section
        });
      }
    }

    const defaultStats = [
      { name: "average_savings", value: "35%", subtext: "Ahorro Promedio", visible: true, displayOrder: 0 },
      { name: "energy_generated", value: "500+", subtext: "MWh Generados", visible: true, displayOrder: 1 },
    ];

    for (const stat of defaultStats) {
      const exists = await prisma.statistic.findUnique({ where: { name: stat.name } });
      if (!exists) {
        await prisma.statistic.create({ data: stat });
      }
    }

    const defaultProjects = [
      {
        name: "Planta de Producción Industrial",
        description: "Instalación completa de sistema fotovoltaico en planta de producción industrial. El proyecto incluyó el diseño, suministro e instalación de paneles solares de alta eficiencia, inversores trifásicos y sistema de monitoreo inteligente. La instalación permite una reducción del 70% en los costos energéticos mensuales.",
        partnerCompany: "Industria Manufacturera S.A.",
        powerKwp: 150.0,
        projectType: "Industrial",
        location: "Cundinamarca",
        impact: "Esta instalación evita la emisión de 85 toneladas de CO2 al año, equivalente a plantar 425 árboles. La empresa ahora produce su propia energía limpia, reduciendo su dependencia de la red eléctrica nacional.",
        imageUrl: "https://images.unsplash.com/photo-1592833159155-c62df1b65634?q=80&w=2076&auto=format&fit=crop",
        technicalSpecs: `Sistema Fotovoltaico:
- Potencia: 150 kWp
- Paneles: 450 unidades de 335Wp cada uno
- Inversores: 3 unidades trifásicas de 50kW
- Estructuras: Fijación en techo industrial
- Monitoreo: Sistema SCADA integrado
- Garantía: 25 años lineales`,
        visible: true,
        displayOrder: 0,
      },
      {
        name: "Casa Inteligente E02",
        description: "Proyecto residencial de alta gama con integración completa de energías renovables. Incluye sistema fotovoltaico, batería de almacenamiento y domótica inteligente para gestión energética automática. El hogar es completamente autosuficiente energéticamente.",
        partnerCompany: "Constructora Premium Ltda.",
        powerKwp: 12.5,
        projectType: "Residencial",
        location: "Bogotá",
        impact: "La casa inteligente reduce su huella de carbono en un 90%, generando excedentes energéticos que se inyectan a la red. El sistema de batería permite autonomía completa durante 48 horas en caso de apagones.",
        imageUrl: "https://images.unsplash.com/photo-1613665813446-82a78c468a1d?q=80&w=2058&auto=format&fit=crop",
        technicalSpecs: `Sistema Residencial Inteligente:
- Potencia: 12.5 kWp
- Paneles: 30 unidades de 417Wp cada uno
- Batería: 20 kWh de almacenamiento
- Inversor: Híbrido con respaldo
- Domótica: Control inteligente de consumo
- ROI: Retorno en 6 años`,
        visible: true,
        displayOrder: 1,
      },
    ];

    for (const project of defaultProjects) {
      const exists = await prisma.project.findUnique({ where: { name: project.name } });
      if (!exists) {
        await prisma.project.create({ data: project });
      }
    }

    return NextResponse.json({ message: "Setup completed successfully", user: "admin", pass: "solpower2024" });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json({ error: "Setup failed" }, { status: 500 });
  }
}
