import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function GET() {
  try {
    const prisma = await getPrisma();
    const projects = await prisma.project.findMany({
      where: { visible: true },
      orderBy: { displayOrder: "asc" }
    });
    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Failed to fetch projects", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const prisma = await getPrisma();
    const body = await request.json();
    const project = await prisma.project.create({
      data: {
        name: body.name ?? "Proyecto Nuevo",
        description: body.description ?? "",
        partnerCompany: body.partnerCompany ?? "",
        powerKwp: body.powerKwp ?? 0,
        projectType: body.projectType ?? "Industrial",
        location: body.location ?? "",
        impact: body.impact ?? "",
        imageUrl: body.imageUrl ?? "",
        technicalSpecs: body.technicalSpecs ?? "",
        visible: body.visible ?? true,
        displayOrder: body.displayOrder ?? 0,
      },
    });
    return NextResponse.json({ success: true, project });
  } catch (error) {
    console.error("Failed to create project", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}