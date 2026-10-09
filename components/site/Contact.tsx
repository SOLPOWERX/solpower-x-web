"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { media } from "@/lib/content";
import { site } from "@/lib/site";

const services = [
  "Sistema solar on-grid",
  "Sistema solar off-grid",
  "Sistema solar híbrido",
  "BESS / almacenamiento",
  "Análisis técnico-financiero",
  "Legalización y certificación RETIE",
  "Redes, subestaciones o instalaciones eléctricas",
  "Otro",
];

type Status = "idle" | "sending" | "sent" | "error";

const field =
  "w-full rounded-xl border border-azul/15 bg-humo px-4 py-3.5 text-tinta outline-none transition focus:border-sol focus:bg-white focus:ring-4 focus:ring-sol/15";

export default function Contact({ imagen }: { imagen?: string }) {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus("sending");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      if (!res.ok) throw new Error();
      form.reset();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="contacto" className="bg-white py-24 md:py-32">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[32px] shadow-[0_40px_90px_-40px_rgba(13,43,94,.55)] lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative min-h-[420px] p-8 text-white md:p-12">
          <Image src={imagen ?? `${media.heroPoster}?w=1400&q=70&auto=format`} alt="" fill sizes="50vw" unoptimized={imagen?.endsWith(".svg")} className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-azul/95 via-azul/85 to-azul-950/90" />
          <div className="relative flex h-full flex-col">
            <p className="mb-4 font-semibold text-sol">Contáctanos</p>
            <h2 className="title">Conversemos sobre tu proyecto</h2>
            <p className="mt-5 max-w-sm text-white/80">
              Cuéntanos qué necesitas y te respondemos con los siguientes pasos y una cotización.
            </p>
            <dl className="mt-auto space-y-5 pt-12">
              <div>
                <dt className="text-sm text-white/60">WhatsApp y teléfono</dt>
                <dd>
                  <a href={`${site.whatsapp}un%20proyecto`} target="_blank" rel="noopener noreferrer" className="text-xl font-semibold hover:text-sol">
                    {site.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-white/60">Correo</dt>
                <dd>
                  <a href={`mailto:${site.email}`} className="text-xl font-semibold hover:text-sol">
                    {site.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-white/60">Cobertura</dt>
                <dd className="text-xl font-semibold">Toda Colombia</dd>
              </div>
            </dl>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 bg-white p-6 md:p-12">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-medium text-azul">
              Nombre
              <input name="name" required autoComplete="name" className={field} />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-azul">
              Teléfono
              <input name="phone" type="tel" autoComplete="tel" className={field} />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-azul">
              Correo electrónico
              <input name="email" type="email" required autoComplete="email" className={field} />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-azul">
              Empresa (opcional)
              <input name="company" autoComplete="organization" className={field} />
            </label>
          </div>
          <label className="grid gap-1.5 text-sm font-medium text-azul">
            Servicio
            <select name="interest" className={field} defaultValue={services[0]}>
              {services.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-azul">
            Mensaje
            <textarea name="message" required rows={4} placeholder="Ciudad, tipo de inmueble, valor de tu factura o potencia aproximada…" className={field} />
          </label>
          <label className="flex items-start gap-3 text-sm text-gris">
            <input type="checkbox" name="consent" value="si" required className="mt-1 h-4 w-4 accent-[#0d2b5e]" />
            Autorizo el tratamiento de mis datos personales para recibir respuesta a esta solicitud, según la Ley 1581 de 2012.
          </label>
          <button type="submit" disabled={status === "sending"} className="btn-sol mt-2 disabled:opacity-60">
            {status === "sending" ? "Enviando…" : "Enviar mensaje"}
          </button>
          <AnimatePresence mode="wait">
            {status === "sent" && (
              <motion.p key="ok" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="status" className="rounded-xl bg-green-50 p-4 text-sm text-green-800">
                Mensaje enviado. Te contactaremos pronto al correo que dejaste.
              </motion.p>
            )}
            {status === "error" && (
              <motion.p key="err" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800">
                No se pudo enviar el mensaje. Escríbenos por WhatsApp al{" "}
                <a href={`${site.whatsapp}un%20proyecto`} className="font-semibold underline">
                  {site.phone}
                </a>
                .
              </motion.p>
            )}
          </AnimatePresence>
        </form>
      </div>
    </section>
  );
}
