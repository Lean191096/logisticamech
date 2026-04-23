"use client";

import { useState } from "react";
import { cambiarClaveAdmin } from "@/app/actions";

export default function ConfiguracionPage() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    const formData = new FormData(e.currentTarget);
    
    const nuevaClave = formData.get("nuevaClave") as string;
    const confirmarClave = formData.get("confirmarClave") as string;
    
    if (nuevaClave !== confirmarClave) {
      setError("Las contraseñas nuevas no coinciden.");
      setLoading(false);
      return;
    }
    
    try {
      await cambiarClaveAdmin(formData);
      setSuccess("Contraseña actualizada exitosamente.");
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      setError(err.message || "Error al cambiar la contraseña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1>Configuración</h1>
      </div>

      <div className="card" style={{ maxWidth: '600px' }}>
        <h2 className="mb-4 text-xl">Cambiar Contraseña de Administrador</h2>
        
        {error && (
          <div style={{ background: 'var(--danger)', color: 'white', padding: '0.75rem', borderRadius: 'var(--radius)', marginBottom: '1rem', fontWeight: 600 }}>
            {error}
          </div>
        )}
        
        {success && (
          <div style={{ background: 'var(--success)', color: 'white', padding: '0.75rem', borderRadius: 'var(--radius)', marginBottom: '1rem', fontWeight: 600 }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block mb-2 font-semibold">Contraseña Actual</label>
            <input type="password" name="claveActual" required className="input" placeholder="••••••••" />
          </div>

          <div>
            <label className="block mb-2 font-semibold">Nueva Contraseña</label>
            <input type="password" name="nuevaClave" required className="input" placeholder="••••••••" minLength={6} />
          </div>
          
          <div>
            <label className="block mb-2 font-semibold">Confirmar Nueva Contraseña</label>
            <input type="password" name="confirmarClave" required className="input" placeholder="••••••••" minLength={6} />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '1rem', fontSize: '1.1rem', marginTop: '1rem' }}>
            {loading ? 'Guardando...' : 'Cambiar Contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}
