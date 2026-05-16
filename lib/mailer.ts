import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface LeadEmailData {
  name: string;
  email: string;
  interest: string;
  message: string;
}

export async function sendLeadNotification(lead: LeadEmailData) {
  const recipient = process.env.EMAIL_NOTIFY_TO || "solpower.x@hotmail.com";

  try {
    const { data, error } = await resend.emails.send({
      from: "SOLPOWER X <onboarding@resend.dev>",
      to: [recipient],
      subject: `🌞 Nueva cotización recibida de ${lead.name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: Arial, sans-serif; background: #0a0a0a; color: #e0e0e0; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 30px auto; background: #141414; border-radius: 12px; border: 1px solid rgba(245,158,11,0.3); overflow: hidden; }
            .header { background: linear-gradient(135deg, #f59e0b, #d97706); padding: 30px; text-align: center; }
            .header h1 { margin: 0; color: #000; font-size: 22px; letter-spacing: 4px; font-weight: 900; }
            .header p { margin: 6px 0 0; color: #000; font-size: 12px; letter-spacing: 2px; }
            .body { padding: 30px; }
            .field { margin-bottom: 20px; border-left: 3px solid #f59e0b; padding-left: 14px; }
            .field label { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #888; display: block; margin-bottom: 4px; }
            .field span { font-size: 16px; color: #f0f0f0; font-weight: 600; }
            .message-box { background: #1e1e1e; border-radius: 8px; padding: 16px; color: #ccc; font-size: 14px; line-height: 1.6; white-space: pre-wrap; }
            .footer { text-align: center; padding: 16px; font-size: 11px; color: #555; border-top: 1px solid #222; }
            .badge { display: inline-block; background: rgba(245,158,11,0.2); color: #f59e0b; border: 1px solid rgba(245,158,11,0.5); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
            a { color: #f59e0b; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚡ SOLPOWER X</h1>
              <p>NUEVA SOLICITUD DE COTIZACIÓN</p>
            </div>
            <div class="body">
              <div class="field">
                <label>Nombre del Cliente</label>
                <span>${lead.name}</span>
              </div>
              <div class="field">
                <label>Correo Electrónico</label>
                <span><a href="mailto:${lead.email}">${lead.email}</a></span>
              </div>
              <div class="field">
                <label>Tipo de Interés</label>
                <span class="badge">${lead.interest}</span>
              </div>
              <div class="field">
                <label>Mensaje</label>
                <div class="message-box">${lead.message}</div>
              </div>
            </div>
            <div class="footer">
              Responder al cliente desde su correo o gestionar leads en su bandeja.
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("⚠️ Resend error:", error);
    } else {
      console.log("✅ Email enviado correctamente. ID:", data?.id);
    }
  } catch (err) {
    console.error("⚠️ Error enviando email de notificación:", err);
  }
}
