"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

type Section = {
  id: string;
  name: string;
  status: "visible" | "hidden" | "draft";
};

type Lead = {
  id: string;
  name: string;
  email: string;
  interest: string;
  message: string;
  createdAt: string;
};
type Statistic = {
  id: string;
  name: string;
  value: string;
  subtext: string;
  visible: boolean;
};

type Project = {
  id: string;
  name: string;
  description: string;
  partnerCompany: string;
  powerKwp: number;
  projectType: string;
  location: string;
  impact: string;
  imageUrl: string;
  technicalSpecs: string;
  visible: boolean;
  displayOrder: number;
};

export default function WorkspacePage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<Statistic[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [newStat, setNewStat] = useState({ name: "", value: "", subtext: "", visible: true });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [secRes, leadRes, statRes, projRes] = await Promise.all([
          fetch("/api/sections"),
          fetch("/api/leads"),
          fetch("/api/stats"),
          fetch("/api/projects")
        ]);
        const secData = await secRes.json();
        const leadData = await leadRes.json();
        const statData = await statRes.json();
        const projData = await projRes.json();
        
        if (secData.sections) setSections(secData.sections);
        if (leadData.leads) setLeads(leadData.leads);
        if (statData.stats) setStats(statData.stats);
        if (projData.projects) setProjects(projData.projects);
      } catch (e) {
        console.error("Failed to fetch data", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleStatusChange = async (name: string, newStatus: string) => {
    // Optimistic update
    setSections(prev => prev.map(s => s.name === name ? { ...s, status: newStatus as any } : s));
    
    await fetch("/api/sections", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, status: newStatus }),
    });
  };

  const handleStatChange = (id: string, field: keyof Statistic, value: string | boolean) => {
    setStats(prev => prev.map(stat => stat.id === id ? { ...stat, [field]: value } : stat));
  };

  const handleSaveStat = async (stat: Statistic) => {
    await fetch("/api/stats", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(stat),
    });
  };

  const handleCreateStat = async () => {
    if (!newStat.name.trim() || !newStat.value.trim() || !newStat.subtext.trim()) {
      return;
    }

    const res = await fetch("/api/stats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newStat,
        displayOrder: stats.length,
      }),
    });

    const data = await res.json();
    if (data.stat) {
      setStats(prev => [...prev, data.stat]);
      setNewStat({ name: "", value: "", subtext: "", visible: true });
    }
  };

  const handleProjectChange = (id: string, field: keyof Project, value: string | boolean | number) => {
    setProjects(prev => prev.map(project => project.id === id ? { ...project, [field]: value } : project));
  };

  const handleSaveProject = async (project: Project) => {
    await fetch("/api/projects", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(project),
    });
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/workspace/login");
    router.refresh();
  };

  const exportToCSV = () => {
    const headers = ["Fecha", "Nombre", "Email", "Interés", "Mensaje"];
    const rows = leads.map(l => [
      new Date(l.createdAt).toLocaleDateString(),
      `"${l.name}"`,
      `"${l.email}"`,
      `"${l.interest}"`,
      `"${l.message.replace(/\n/g, " ")}"`
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "solpower_leads.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-on-surface">Cargando Workspace...</div>;
  }

  return (
    <div className="min-h-screen bg-background text-on-background p-8 font-body-md">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex justify-between items-center bg-surface p-6 rounded-2xl border border-on-surface-variant/10">
          <div>
            <h1 className="text-2xl font-headline-sm text-on-surface uppercase tracking-widest">SOLPOWER X</h1>
            <p className="text-on-surface-variant text-sm">Panel de Control Principal</p>
          </div>
          <button 
            onClick={handleLogout}
            className="text-solar-yellow hover:text-solar-yellow/80 transition-colors flex items-center gap-2 font-label-md uppercase tracking-wider"
          >
            <span className="material-symbols-outlined">logout</span> Salir
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sections Control */}
          <div className="glass p-6 rounded-2xl border border-primary/20 energy-glow flex flex-col h-full">
            <h2 className="text-xl font-headline-sm text-primary mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined">toggle_on</span> Visibilidad de Secciones
            </h2>
            <div className="space-y-4 flex-grow">
              {sections.map(section => (
                <div key={section.id} className="flex items-center justify-between bg-surface-container p-4 rounded-xl">
                  <span className="uppercase text-sm tracking-wider font-bold text-on-surface">{section.name}</span>
                  <select
                    value={section.status}
                    onChange={(e) => handleStatusChange(section.name, e.target.value)}
                    className="bg-background text-on-surface text-sm p-2 rounded border border-on-surface-variant/30 focus:ring-0 focus:border-primary uppercase tracking-wider"
                  >
                    <option value="visible">Visible</option>
                    <option value="hidden">Oculto</option>
                    <option value="draft">Borrador</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Control */}
          <div className="glass p-6 rounded-2xl border border-primary/20 energy-glow flex flex-col h-full">
            <h2 className="text-xl font-headline-sm text-primary mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined">insights</span> Indicadores Dinámicos
            </h2>
            <div className="space-y-4 flex-grow">
              {stats.map((stat) => (
                <div key={stat.id} className="bg-surface-container p-4 rounded-xl space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-on-surface uppercase tracking-widest text-sm">{stat.name}</span>
                    <label className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-on-surface-variant">
                      <input
                        type="checkbox"
                        checked={stat.visible}
                        onChange={(e) => {
                          handleStatChange(stat.id, "visible", e.target.checked);
                          handleSaveStat({ ...stat, visible: e.target.checked });
                        }}
                      />
                      Visible
                    </label>
                  </div>
                  <input
                    value={stat.value}
                    onChange={(e) => handleStatChange(stat.id, "value", e.target.value)}
                    placeholder="Valor (ej. 35%, 500+)"
                    className="w-full rounded-lg border border-on-surface-variant/20 bg-background px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
                  />
                  <input
                    value={stat.subtext}
                    onChange={(e) => handleStatChange(stat.id, "subtext", e.target.value)}
                    placeholder="Texto visual (ej. Ahorro Promedio)"
                    className="w-full rounded-lg border border-on-surface-variant/20 bg-background px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
                  />
                  <button
                    onClick={() => handleSaveStat(stat)}
                    className="w-full bg-primary text-on-primary px-4 py-2 rounded-lg uppercase tracking-widest text-xs font-bold hover:bg-primary/90 transition-colors"
                  >
                    Guardar indicador
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-6 border-t border-on-surface-variant/10 pt-4">
              <h3 className="text-sm uppercase tracking-widest text-on-surface-variant mb-3">Nuevo indicador</h3>
              <div className="grid gap-3">
                <input
                  value={newStat.name}
                  onChange={(e) => setNewStat((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Identificador único"
                  className="w-full rounded-lg border border-on-surface-variant/20 bg-background px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
                />
                <input
                  value={newStat.value}
                  onChange={(e) => setNewStat((prev) => ({ ...prev, value: e.target.value }))}
                  placeholder="Valor (ej. 100%, 2 MWp)"
                  className="w-full rounded-lg border border-on-surface-variant/20 bg-background px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
                />
                <input
                  value={newStat.subtext}
                  onChange={(e) => setNewStat((prev) => ({ ...prev, subtext: e.target.value }))}
                  placeholder="Texto visual (ej. Potencia Instalada)"
                  className="w-full rounded-lg border border-on-surface-variant/20 bg-background px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
                />
                <div className="flex items-center justify-between gap-4">
                  <label className="inline-flex items-center gap-2 text-sm text-on-surface-variant">
                    <input
                      type="checkbox"
                      checked={newStat.visible}
                      onChange={(e) => setNewStat((prev) => ({ ...prev, visible: e.target.checked }))}
                    />
                    Visible
                  </label>
                  <button
                    onClick={handleCreateStat}
                    className="bg-secondary-container text-on-secondary-container px-4 py-2 rounded-lg uppercase tracking-widest text-xs font-bold hover:opacity-90 transition-opacity"
                  >
                    Agregar indicador
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Projects Control */}
          <div className="glass p-6 rounded-2xl border border-primary/20 energy-glow flex flex-col h-full">
            <h2 className="text-xl font-headline-sm text-primary mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined">engineering</span> Gestión de Proyectos
            </h2>
            <div className="space-y-4 flex-grow overflow-y-auto">
              {projects.map((project) => (
                <div key={project.id} className="bg-surface-container p-4 rounded-xl space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-on-surface uppercase tracking-widest text-sm truncate">{project.name}</span>
                    <label className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-on-surface-variant">
                      <input
                        type="checkbox"
                        checked={project.visible}
                        onChange={(e) => {
                          handleProjectChange(project.id, "visible", e.target.checked);
                          handleSaveProject({ ...project, visible: e.target.checked });
                        }}
                      />
                      Visible
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={project.powerKwp}
                      onChange={(e) => handleProjectChange(project.id, "powerKwp", parseFloat(e.target.value) || 0)}
                      placeholder="Potencia (kWp)"
                      type="number"
                      step="0.1"
                      className="w-full rounded-lg border border-on-surface-variant/20 bg-background px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
                    />
                    <select
                      value={project.projectType}
                      onChange={(e) => handleProjectChange(project.id, "projectType", e.target.value)}
                      className="w-full rounded-lg border border-on-surface-variant/20 bg-background px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
                    >
                      <option value="Industrial">Industrial</option>
                      <option value="Comercial">Comercial</option>
                      <option value="Residencial">Residencial</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={project.location}
                      onChange={(e) => handleProjectChange(project.id, "location", e.target.value)}
                      placeholder="Ubicación"
                      className="w-full rounded-lg border border-on-surface-variant/20 bg-background px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
                    />
                    <input
                      value={project.partnerCompany}
                      onChange={(e) => handleProjectChange(project.id, "partnerCompany", e.target.value)}
                      placeholder="Empresa socia"
                      className="w-full rounded-lg border border-on-surface-variant/20 bg-background px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>
                  <textarea
                    value={project.description}
                    onChange={(e) => handleProjectChange(project.id, "description", e.target.value)}
                    placeholder="Descripción detallada"
                    rows={4}
                    className="w-full rounded-lg border border-on-surface-variant/20 bg-background px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary resize-none"
                  />
                  <textarea
                    value={project.impact}
                    onChange={(e) => handleProjectChange(project.id, "impact", e.target.value)}
                    placeholder="Impacto energético / Beneficios"
                    rows={2}
                    className="w-full rounded-lg border border-on-surface-variant/20 bg-background px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary resize-none"
                  />
                  <textarea
                    value={project.technicalSpecs}
                    onChange={(e) => handleProjectChange(project.id, "technicalSpecs", e.target.value)}
                    placeholder="Especificaciones técnicas (ej. Paneles: 550W Jinko...)"
                    rows={2}
                    className="w-full rounded-lg border border-on-surface-variant/20 bg-background px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary resize-none"
                  />
                  <button
                    onClick={() => handleSaveProject(project)}
                    className="w-full bg-primary text-on-primary px-4 py-2 rounded-lg uppercase tracking-widest text-xs font-bold hover:bg-primary/90 transition-colors"
                  >
                    Actualizar Proyecto Premium
                  </button>
                </div>
              ))}
            </div>
            {projects.length === 0 && (
              <div className="text-center text-on-surface-variant italic py-8">
                No hay proyectos registrados. Ejecuta el setup para crear proyectos de ejemplo.
              </div>
            )}
          </div>

          {/* Leads Data */}
          <div className="glass p-6 rounded-2xl border border-on-surface-variant/10 lg:col-span-2 flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-headline-sm text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined">group</span> Contactos / Leads
              </h2>
              <button 
                onClick={exportToCSV}
                className="bg-secondary-container text-on-secondary-container px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-opacity"
              >
                <span className="material-symbols-outlined text-sm">download</span> Exportar CSV
              </button>
            </div>
            
            <div className="overflow-x-auto bg-surface-container rounded-xl flex-grow">
              {leads.length === 0 ? (
                <div className="p-8 text-center text-on-surface-variant italic">No hay contactos registrados todavía.</div>
              ) : (
                <table className="w-full text-left text-sm text-on-surface-variant">
                  <thead className="text-xs uppercase bg-surface-container-high text-on-surface tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Fecha</th>
                      <th className="px-6 py-4">Nombre</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Interés</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => (
                      <tr key={lead.id} className="border-b border-on-surface-variant/10 hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">{new Date(lead.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 font-medium text-on-surface">{lead.name}</td>
                        <td className="px-6 py-4">{lead.email}</td>
                        <td className="px-6 py-4">
                          <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">{lead.interest}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
