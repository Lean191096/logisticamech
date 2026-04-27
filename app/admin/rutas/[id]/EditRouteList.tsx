"use client";

import { useState } from "react";
import { ArrowUp, ArrowDown, Trash2, Save } from "lucide-react";
import { actualizarOrdenRuta, removerPedidoDeRuta } from "@/app/actions";

export default function EditRouteList({ rutaId, pedidosIniciales }: { rutaId: number, pedidosIniciales: any[] }) {
  const [pedidos, setPedidos] = useState(pedidosIniciales);
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newPedidos = [...pedidos];
    const temp = newPedidos[index];
    newPedidos[index] = newPedidos[index - 1];
    newPedidos[index - 1] = temp;
    setPedidos(newPedidos);
    setHasChanges(true);
  };

  const moveDown = (index: number) => {
    if (index === pedidos.length - 1) return;
    const newPedidos = [...pedidos];
    const temp = newPedidos[index];
    newPedidos[index] = newPedidos[index + 1];
    newPedidos[index + 1] = temp;
    setPedidos(newPedidos);
    setHasChanges(true);
  };

  const handleRemove = async (pedidoId: number) => {
    if (!confirm("¿Seguro que deseas remover este pedido de la ruta? (Volverá a estar pendiente)")) return;
    setLoading(true);
    try {
      await removerPedidoDeRuta(pedidoId, rutaId);
      const newPedidos = pedidos.filter(p => p.id !== pedidoId);
      setPedidos(newPedidos);
    } catch (e) {
      alert("Error al remover el pedido.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const ordenIds = pedidos.map(p => p.id);
      await actualizarOrdenRuta(rutaId, ordenIds);
      setHasChanges(false);
      alert("Orden actualizado exitosamente.");
    } catch (e) {
      alert("Error al guardar el nuevo orden.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3>Historial y Estado de Paradas</h3>
        {hasChanges && (
          <button 
            onClick={handleSave} 
            disabled={loading} 
            className="btn btn-primary text-sm flex items-center gap-2"
          >
            <Save size={16} /> {loading ? "Guardando..." : "Guardar Nuevo Orden"}
          </button>
        )}
      </div>
      
      <div className="flex flex-col gap-4">
        {pedidos.map((p, idx) => (
          <div key={p.id} className="card relative group" style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--background)' }}>
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1 mr-2 opacity-50 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => moveUp(idx)} 
                    disabled={idx === 0 || loading}
                    className="p-1 hover:bg-[var(--secondary)] rounded"
                    title="Mover arriba"
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button 
                    onClick={() => moveDown(idx)} 
                    disabled={idx === pedidos.length - 1 || loading}
                    className="p-1 hover:bg-[var(--secondary)] rounded"
                    title="Mover abajo"
                  >
                    <ArrowDown size={16} />
                  </button>
                </div>
                <div>
                  <strong style={{ fontSize: '1.1rem' }}>{idx + 1}. {p.cliente.nombre}</strong>
                  <div style={{ fontSize: '0.9rem', color: 'var(--secondary-foreground)' }}>{p.cliente.direccion}</div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`badge`} style={{ 
                  background: p.estado === 'Entregado' ? 'var(--success)' : p.estado === 'En Camino' ? 'var(--warning)' : p.estado === 'No Entregado' ? 'var(--danger)' : 'var(--secondary)'
                }}>
                  {p.estado}
                </span>
                {p.estado !== 'Entregado' && p.estado !== 'No Entregado' && (
                  <button 
                    onClick={() => handleRemove(p.id)}
                    disabled={loading}
                    className="text-[var(--danger)] text-sm flex items-center gap-1 hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} /> Quitar de ruta
                  </button>
                )}
              </div>
            </div>
            {p.observacion && (
              <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: 'var(--radius)', fontSize: '0.9rem' }}>
                <strong>Observación del Chofer:</strong> {p.observacion}
              </div>
            )}
          </div>
        ))}
        {pedidos.length === 0 && (
          <p className="text-sm text-[var(--secondary-foreground)]">No hay paradas en esta ruta.</p>
        )}
      </div>
    </div>
  );
}
