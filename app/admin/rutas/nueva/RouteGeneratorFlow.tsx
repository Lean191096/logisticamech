"use client";

import { useState } from "react";
import { previsualizarRuta, guardarRutaConfirmada } from "@/app/actions";
import InteractiveRoutePreview from "./InteractiveRoutePreview";
import Link from "next/link";

export default function RouteGeneratorFlow({ choferes, clientes }: { choferes: any[], clientes: any[] }) {
  const [previewData, setPreviewData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    try {
      const result = await previsualizarRuta(formData);
      if (result.success) {
        setPreviewData(result);
      } else {
        setError(result.error);
      }
    } catch (err: any) {
      setError(err.message || "Ocurrió un error inesperado al generar la ruta.");
    }
    setLoading(false);
  };

  const handleConfirm = async (orderedIds: number[]) => {
    setLoading(true);
    try {
      await guardarRutaConfirmada(previewData.chofer.id, orderedIds);
    } catch (err: any) {
      setError("Error al confirmar la ruta.");
      setLoading(false);
    }
  };

  if (previewData) {
    return (
      <InteractiveRoutePreview 
        data={previewData} 
        onConfirm={handleConfirm} 
        onCancel={() => setPreviewData(null)} 
        loading={loading}
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1>Armar Hoja de Ruta</h1>
        <Link href="/admin/rutas" className="btn btn-secondary">Volver</Link>
      </div>

      <div className="card" style={{ maxWidth: '800px' }}>
        {error && (
          <div className="mb-4" style={{ background: 'var(--danger)', color: 'white', padding: '1rem', borderRadius: 'var(--radius)' }}>
            {error}
          </div>
        )}
        <form onSubmit={handleGenerate} className="flex flex-col gap-6">
          <div>
            <label className="block mb-2 font-semibold">Seleccionar Chofer</label>
            <select name="chofer_id" required className="input" style={{ width: '100%' }}>
              <option value="">-- Elige un chofer disponible --</option>
              {choferes.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 font-semibold">Seleccionar Clientes para Visitar Hoy</label>
            <p className="mb-4 text-sm" style={{ color: 'var(--secondary-foreground)' }}>
              Selecciona los clientes y previsualiza la ruta óptima antes de asignarla.
            </p>
            
            {clientes.length === 0 ? (
              <div className="alert" style={{ background: 'var(--secondary)', padding: '1rem', borderRadius: 'var(--radius)' }}>
                No tienes clientes cargados en el sistema. Primero agrega clientes en el menú lateral.
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '1rem' }}>
                {clientes.map(cliente => (
                  <label key={cliente.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', cursor: 'pointer', border: '1px solid var(--border)', transition: 'all 0.2s' }}>
                    <input type="checkbox" name="clientes" value={cliente.id} style={{ transform: 'scale(1.5)', cursor: 'pointer' }} />
                    <div>
                      <strong style={{ fontSize: '1.1rem' }}>{cliente.nombre}</strong>
                      <div style={{ fontSize: '0.9rem', color: 'var(--secondary-foreground)', marginTop: '0.2rem' }}>
                        📍 {cliente.direccion}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary mt-4" 
            style={{ padding: '1rem', fontSize: '1.1rem' }}
            disabled={clientes.length === 0 || loading}
          >
            {loading ? "Calculando ruta óptima..." : "Previsualizar Ruta"}
          </button>
        </form>
      </div>
    </div>
  );
}
