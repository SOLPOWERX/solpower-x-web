"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        router.push("/workspace");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Error de autenticación");
      }
    } catch (err) {
      setError("Error de red");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background bg-mesh px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-8 rounded-2xl w-full max-w-md energy-glow"
      >
        <div className="text-center mb-8">
          <h1 className="font-headline-sm text-2xl text-on-surface uppercase tracking-widest mb-2">SOLPOWER X</h1>
          <p className="text-on-surface-variant text-sm uppercase tracking-widest">Workspace Privado</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-label-md uppercase mb-2 text-on-surface-variant">Usuario</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-surface-container-high border-none border-b-2 border-primary/40 focus:border-primary focus:ring-0 text-on-surface p-4 rounded-lg transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-label-md uppercase mb-2 text-on-surface-variant">Contraseña</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface-container-high border-none border-b-2 border-primary/40 focus:border-primary focus:ring-0 text-on-surface p-4 rounded-lg transition-all"
              required
            />
          </div>

          {error && <p className="text-error text-sm font-medium">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-secondary-container text-on-secondary-container py-4 rounded-lg font-label-md font-bold uppercase tracking-widest hover:scale-[1.02] transition-transform disabled:opacity-50"
          >
            {loading ? "Accediendo..." : "Ingresar"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
