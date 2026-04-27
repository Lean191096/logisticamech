"use client";

import { useState } from "react";
import { cambiarClaveAdmin } from "@/app/actions";
import { useRouter } from "next/navigation";

export default function CambiarClaveInicialPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    
    // As in this screen we enforce the old password is "123456" for convenience,
    // we can either add a hidden input or ask the user to type it.
    // For security and simplicity, let's just ask the user to type it.
    
    const nuevaClave = formData.get("nuevaClave") as string;
    const confirmarClave = formData.get("confirmarClave") as string;
    
    if (nuevaClave !== confirmarClave) {
      setError("Las contraseñas nuevas no coinciden.");
      setLoading(false);
      return;
    }
    
    try {
      await cambiarClaveAdmin(formData);
      router.push("/admin"); // Redirect to home after success
    } catch (err: any) {
      setError(err.message || "Error al cambiar la contraseña.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen" style={{ backgroundColor: '#ffffff', padding: '1rem', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 }}>
      <div style={{ maxWidth: '500px', width: '100%', padding: '2.5rem 1.5rem', border: '1px solid #eaeaea', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', textAlign: 'center', backgroundColor: 'white' }}>
        <h2 className="mb-2 text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Cambio de Contraseña Requerido</h2>
        <p className="mb-8" style={{ color: 'var(--foreground)', opacity: 0.8 }}>
          Por seguridad, debes cambiar tu contraseña inicial antes de continuar.
        </p>
        
        {error && (
          <div style={{ background: 'var(--danger)', color: 'white', padding: '0.75rem', borderRadius: 'var(--radius)', marginBottom: '1rem', fontWeight: 600 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
          <div>
            <label className="block mb-2 font-semibold">Contraseña Actual (123456)</label>
            <input type="password" name="claveActual" required className="input" placeholder="Tu contraseña actual" />
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
            {loading ? 'Guardando...' : 'Cambiar Contraseña y Continuar'}
          </button>
        </form>
      </div>
    </div>
  );
}
