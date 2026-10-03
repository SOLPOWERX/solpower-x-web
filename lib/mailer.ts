import { Resend } from "resend";
import { site } from "@/lib/site";

export interface LeadEmailData {
  name: string;
  email: string;
  phone: string;
  company: string;
  interest: string;
  message: string;
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Envía el mensaje del formulario al correo de SOLPOWER X. Devuelve false si no se pudo enviar. */
export async function sendLeadNotification(lead: LeadEmailData): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY no está configurada");
    return false;
  }
  const resend = new Resend(apiKey);
  const recipient = process.env.EMAIL_NOTIFY_TO || site.email;

  const row = (label: string, value: string) =>
    `<tr><td style="padding:8px 12px;color:#5b6b88;font-size:13px;width:120px">${label}</td><td style="padding:8px 12px;color:#0b1b33;font-size:15px">${value}</td></tr>`;

  try {
    const { error } = await resend.emails.send({
      from: "SOLPOWER X <onboarding@resend.dev>",
      to: [recipient],
      replyTo: lead.email,
      subject: `Nuevo mensaje de ${lead.name}: ${lead.interest}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #c9d4e8;border-radius:12px;overflow:hidden">
  <div style="background:#0d2b5e;color:#fff;padding:20px 24px;font-size:18px;font-weight:bold">SOLPOWER X <span style="color:#f0a500">·</span> Nuevo mensaje desde la web</div>
  <table style="width:100%;border-collapse:collapse;margin:12px 0">
    ${row("Nombre", esc(lead.name))}
    ${row("Correo", `<a href="mailto:${esc(lead.email)}">${esc(lead.email)}</a>`)}
    ${row("Teléfono", esc(lead.phone) || "No indicado")}
    ${row("Empresa", esc(lead.company) || "No indicada")}
    ${row("Servicio", esc(lead.interest))}
  </table>
  <div style="margin:0 24px 24px;padding:16px;background:#f3f6fa;border-radius:8px;white-space:pre-wrap;color:#0b1b33;line-height:1.5">${esc(lead.message)}</div>
  <div style="padding:12px 24px;font-size:12px;color:#5b6b88;border-top:1px solid #c9d4e8">Responde este correo para contestarle directamente al cliente.</div>
</div>`,
    });
    if (error) {
      console.error("Error de Resend:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Error enviando el correo:", err);
    return false;
  }
}
