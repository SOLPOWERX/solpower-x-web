"use client";

import { useState } from "react";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    interest: "Energía Solar Residencial",
    message: ""
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", interest: "Energía Solar Residencial", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="py-24 px-4 md:px-12 max-w-[1440px] mx-auto" id="contacto">
      <div className="glass rounded-3xl overflow-hidden flex flex-col lg:flex-row shadow-2xl energy-glow border border-primary/20">
        
        {/* Info Side */}
        <div className="lg:w-1/2 p-12 bg-primary-container relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent"></div>
          
          <h2 className="font-headline-lg text-4xl mb-6 uppercase tracking-tighter text-primary-fixed relative z-10">
            Hablemos de su próximo proyecto
          </h2>
          <p className="font-body-md mb-12 text-primary-fixed/80 relative z-10">
            Estamos listos para transformar su consumo energético. Visítenos en nuestra sede de ingeniería o agende una evaluación técnica.
          </p>
          
          <div className="space-y-8 relative z-10">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-primary-fixed">location_on</span>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-primary-fixed/70 font-medium">Cobertura</p>
                <p className="font-bold text-primary-fixed tracking-wider">Toda Colombia</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-primary-fixed">phone_iphone</span>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-primary-fixed/70 font-medium">WhatsApp Directo</p>
                <p className="font-bold text-primary-fixed tracking-wider">+57 3123312334</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-primary-fixed">mail</span>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-primary-fixed/70 font-medium">Correo</p>
                <p className="font-bold text-primary-fixed tracking-wider">SOLPOWERX@HOTMAIL.COM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Side */}
        <div className="lg:w-1/2 p-12 bg-surface">
          {status === "success" ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-4xl">check_circle</span>
              </div>
              <h3 className="text-2xl font-headline-sm text-on-surface">¡Mensaje Enviado!</h3>
              <p className="text-on-surface-variant">Un ingeniero se pondrá en contacto con usted en breve.</p>
              <button 
                onClick={() => setStatus("idle")}
                className="mt-8 text-primary uppercase text-sm tracking-widest hover:underline"
              >
                Enviar otro mensaje
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase mb-2 text-on-surface tracking-wider">Nombre Completo</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-surface-container-high border-none border-b-2 border-primary/40 focus:border-primary focus:ring-0 text-on-surface p-4 rounded-lg transition-all placeholder:text-on-surface/30" 
                    placeholder="Juan Pérez" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-2 text-on-surface tracking-wider">Email Empresarial</label>
                  <input 
                    required
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-surface-container-high border-none border-b-2 border-primary/40 focus:border-primary focus:ring-0 text-on-surface p-4 rounded-lg transition-all placeholder:text-on-surface/30" 
                    placeholder="juan@empresa.com" 
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase mb-2 text-on-surface tracking-wider">Interés Principal</label>
                <select 
                  value={formData.interest}
                  onChange={(e) => setFormData({...formData, interest: e.target.value})}
                  className="w-full bg-surface-container-high border-none border-b-2 border-primary/40 focus:border-primary focus:ring-0 text-on-surface p-4 rounded-lg transition-all"
                >
                  <option>Energía Solar Residencial</option>
                  <option>Sistemas Industriales On-Grid</option>
                  <option>Sistemas Híbridos / Backup</option>
                  <option>Ingeniería Eléctrica y RETIE</option>
                  <option>Mantenimiento y Auditoría</option>
                  <option>Auditoría Energética RETIE</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase mb-2 text-on-surface tracking-wider">Mensaje</label>
                <textarea 
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full bg-surface-container-high border-none border-b-2 border-primary/40 focus:border-primary focus:ring-0 text-on-surface p-4 rounded-lg transition-all placeholder:text-on-surface/30 resize-none" 
                  placeholder="Cuéntenos sobre sus necesidades energéticas..." 
                ></textarea>
              </div>
              
              {status === "error" && (
                <p className="text-error text-sm font-medium">Ocurrió un error. Por favor intente nuevamente.</p>
              )}

              <button 
                type="submit" 
                disabled={status === "loading"}
                className="w-full bg-secondary-container text-on-secondary-container py-4 rounded-lg text-sm font-bold uppercase tracking-widest hover:scale-[1.02] transition-transform disabled:opacity-50"
              >
                {status === "loading" ? "Enviando..." : "Enviar Solicitud"}
              </button>
            </form>
          )}
        </div>
      </div>
      <div className="mt-12 rounded-3xl overflow-hidden glass border border-primary/20 h-[400px] shadow-2xl relative">
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d127253.94824041763!2d-74.1990412!3d4.6482837!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3f9bfd2da6cb29%3A0x239d635520a33914!2zQm9nb3TDoA!5e0!3m2!1ses!2sco!4v1715810000000!5m2!1ses!2sco" 
          width="100%" 
          height="100%" 
          style={{ border: 0 }} 
          allowFullScreen 
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade"
          className="grayscale invert brightness-75 contrast-125 opacity-70 hover:opacity-100 transition-opacity duration-500"
        ></iframe>
      </div>
    </section>
  );
}
