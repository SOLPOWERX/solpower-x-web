"use client";

import { useState } from "react";
import { site } from "@/lib/site";

const services = [
  "Sistema solar on-grid",
  "Sistema solar off-grid o con baterías",
  "Memoria de cálculo RETIE",
  "Subestación o media tensión",
  "Redes y tableros de baja tensión",
  "Otro",
];

type Status = "idle" | "sending" | "sent" | "error";

const field =
  "w-full rounded-lg border border-linea/40 bg-noche/40 px-4 py-3 text-white placeholder:text-linea focus:border-sol focus:outline-none";

export default function Contact() {
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
    <section id="contacto" className="bg-azul py-24 text-white md:py-32">
      <div className="mx-auto grid max-w-6xl gap-16 px-4 md:grid-cols-[1fr_1.1fr] md:px-8">
        <div>
          <h2 className="display text-[clamp(2.2rem,5vw,4rem)]">Cuéntanos tu proyecto</h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-niebla">
            Escríbenos con lo que necesitas y te respondemos con los siguientes pasos y una cotización.
          </p>
          <dl className="mt-12 space-y-6">
            <div>
              <dt className="text-sm text-niebla">WhatsApp y teléfono</dt>
              <dd>
                <a href={`${site.whatsapp}un%20proyecto`} target="_blank" rel="noopener noreferrer" className="wide text-xl font-bold hover:text-sol">
                  {site.phone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-niebla">Correo</dt>
              <dd>
                <a href={`mailto:${site.email}`} className="wide text-xl font-bold hover:text-sol">
                  {site.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-niebla">Cobertura</dt>
              <dd className="wide text-xl font-bold">Toda Colombia</dd>
            </div>
          </dl>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5 rounded-2xl bg-noche/50 p-6 md:p-8">
          <label className="grid gap-2 text-sm text-niebla">
            Nombre
            <input name="name" required autoComplete="name" className={field} />
          </label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2 text-sm text-niebla">
              Correo
              <input name="email" type="email" required autoComplete="email" className={field} />
            </label>
            <label className="grid gap-2 text-sm text-niebla">
              Teléfono (opcional)
              <input name="phone" type="tel" autoComplete="tel" className={field} />
            </label>
          </div>
          <label className="grid gap-2 text-sm text-niebla">
            Servicio
            <select name="interest" className={field} defaultValue={services[0]}>
              {services.map((s) => (
                <option key={s} className="bg-noche">
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm text-niebla">
            Mensaje
            <textarea
              name="message"
              required
              rows={4}
              placeholder="Ciudad, tipo de inmueble, consumo o potencia aproximada…"
              className={field}
            />
          </label>
          <button
            type="submit"
            disabled={status === "sending"}
            className="mt-2 rounded-full bg-sol px-6 py-3 font-semibold text-noche transition-colors hover:bg-sol-claro disabled:opacity-60"
          >
            {status === "sending" ? "Enviando…" : "Enviar mensaje"}
          </button>
          <p role="status" className="min-h-6 text-sm">
            {status === "sent" && "Mensaje enviado. Te contactaremos al correo que dejaste."}
            {status === "error" && (
              <>
                No se pudo enviar el mensaje. Escríbenos por WhatsApp al{" "}
                <a href={`${site.whatsapp}un%20proyecto`} className="font-semibold text-sol underline">
                  {site.phone}
                </a>
                .
              </>
            )}
          </p>
        </form>
      </div>
    </section>
  );
}
