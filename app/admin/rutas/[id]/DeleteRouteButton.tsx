"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { eliminarRuta } from "@/app/actions";

export default function DeleteRouteButton({ rutaId }: { rutaId: number }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de que deseas eliminar completamente esta ruta? Los pedidos volverán al estado Pendiente.")) return;
    
    setLoading(true);
    try {
      await eliminarRuta(rutaId);
    } catch (e) {
      alert("Error al eliminar la ruta.");
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={loading}
      className="btn btn-secondary text-[var(--danger)] flex items-center gap-2"
      style={{ borderColor: 'var(--danger)' }}
    >
      <Trash2 size={16} /> {loading ? "Eliminando..." : "Eliminar Ruta"}
    </button>
  );
}
