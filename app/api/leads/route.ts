import { NextResponse } from "next/server";
import { sendLeadNotification } from "@/lib/mailer";

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }

  const lead = {
    name: clean(body.name, 120),
    email: clean(body.email, 160),
    phone: clean(body.phone, 40),
    interest: clean(body.interest, 80) || "General",
    message: clean(body.message, 4000),
  };

  if (!lead.name || !lead.message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
    return NextResponse.json({ error: "Faltan nombre, correo válido o mensaje" }, { status: 400 });
  }

  const sent = await sendLeadNotification(lead);
  if (!sent) {
    return NextResponse.json({ error: "No se pudo enviar el correo" }, { status: 502 });
  }
  return NextResponse.json({ success: true });
}
