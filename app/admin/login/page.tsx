"use client";

import { useState } from "react";
import { loginAdmin } from "@/app/actions";
import Link from "next/link";
import { Package } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    try {
      const res = await loginAdmin(formData);
      if (res?.success) {
        router.push("/admin");
      }
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <div className="card text-center" style={{ maxWidth: '400px', width: '100%' }}>
        <img
          src="https://mech.com.ar/wp-content/uploads/2021/09/LOGO-PNG.png"
          alt="Mech Logística Logo"
          style={{ maxWidth: '200px', margin: '0 auto 1rem auto', display: 'block' }}
        />
        <h2 className="mb-2">Acceso Administrador</h2>
        <p className="mb-8" style={{ color: 'var(--foreground)', opacity: 0.7 }}>
          Ingrese sus credenciales para continuar
        </p>

        {error && (
          <div style={{ background: 'var(--danger)', color: 'white', padding: '0.75rem', borderRadius: 'var(--radius)', marginBottom: '1rem', fontWeight: 600 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
          <div>
            <label className="block mb-2 font-semibold">Usuario</label>
            <input type="text" name="usuario" required className="input" placeholder="Tu usuario" />
          </div>

          <div>
            <label className="block mb-2 font-semibold">Contraseña</label>
            <input type="password" name="clave" required className="input" placeholder="••••••••" />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '1rem', fontSize: '1.1rem', marginTop: '1rem' }}>
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--foreground)', opacity: 0.7 }}>¿Eres un conductor?</span>
          <Link href="/chofer/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Package size={16} /> Ir al Portal de Choferes
          </Link>
        </div>
      </div>
    </div>
  );
}
