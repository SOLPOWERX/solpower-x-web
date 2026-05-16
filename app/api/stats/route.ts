import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const stats = await prisma.statistic.findMany({ orderBy: { displayOrder: "asc" } });
    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Failed to fetch stats", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const stat = await prisma.statistic.create({
      data: {
        name: body.name ?? `indicator-${Date.now()}`,
        value: body.value ?? "0",
        subtext: body.subtext ?? "Nuevo Indicador",
        visible: body.visible ?? true,
        displayOrder: body.displayOrder ?? 0,
      },
    });
    return NextResponse.json({ success: true, stat });
  } catch (error) {
    console.error("Failed to create stat", error);
    return NextResponse.json({ error: "Failed to create stat" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: "Missing stat id" }, { status: 400 });
    }

    const updated = await prisma.statistic.update({
      where: { id: body.id },
      data: {
        name: body.name,
        value: body.value,
        subtext: body.subtext,
        visible: body.visible,
        displayOrder: body.displayOrder,
      },
    });

    return NextResponse.json({ success: true, stat: updated });
  } catch (error) {
    console.error("Failed to update stat", error);
    return NextResponse.json({ error: "Failed to update stat" }, { status: 500 });
  }
}
