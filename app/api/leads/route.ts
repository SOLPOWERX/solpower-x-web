import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { sendLeadNotification } from "@/lib/mailer";

export async function GET() {
  try {
    const prisma = await getPrisma();
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json({ leads });
  } catch {
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const prisma = await getPrisma();
    const { name, email, interest, message } = await request.json();
    
    if (!name || !email || !message) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    // 1. Guardar en la base de datos
    const lead = await prisma.lead.create({
      data: { name, email, interest: interest || "General", message },
    });

    // 2. Enviar email de notificación (no bloquea si falla)
    await sendLeadNotification({ name, email, interest: interest || "General", message });

    return NextResponse.json({ success: true, lead });
  } catch {
    return NextResponse.json({ error: "Error al guardar el mensaje" }, { status: 500 });
  }
}
