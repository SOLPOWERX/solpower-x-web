import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function GET() {
  try {
    const prisma = await getPrisma();
    const sections = await prisma.sectionState.findMany();
    return NextResponse.json({ sections });
  } catch {
    return NextResponse.json({ error: "Failed to fetch sections" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const prisma = await getPrisma();
    const { name, status } = await request.json();
    
    if (!name || !status) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const updated = await prisma.sectionState.update({
      where: { name },
      data: { status },
    });

    return NextResponse.json({ success: true, section: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update section" }, { status: 500 });
  }
}
