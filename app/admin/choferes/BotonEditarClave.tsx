"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";
import { cambiarClaveChofer } from "@/app/actions";

export default function BotonEditarClave({ choferId, nombre }: { choferId: number, nombre: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    formData.append("choferId", choferId.toString());
    
    try {
      await cambiarClaveChofer(formData);
      setIsOpen(false);
    } catch (error) {
      alert("Error al cambiar la clave");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        type="button" 
        onClick={() => setIsOpen(true)}
        className="btn btn-secondary" 
        style={{ padding: '0.5rem', marginRight: '0.5rem' }}
        title="Cambiar Contraseña"
      >
        <KeyRound size={16} />
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ width: '400px', margin: '1rem' }}>
            <h3 className="mb-4 text-lg">Cambiar clave de {nombre}</h3>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block mb-2 font-semibold text-sm">Nueva Contraseña</label>
                <input 
                  type="text" 
                  name="nuevaClave" 
                  required 
                  className="input" 
                  placeholder="Ej: 123456" 
                />
              </div>
              
              <div className="flex gap-2 justify-end mt-2">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
