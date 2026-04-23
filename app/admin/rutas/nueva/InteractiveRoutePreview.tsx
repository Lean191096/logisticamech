"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { ArrowUp, ArrowDown, MapPin, Check, X, Info } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Importar Leaflet dinámicamente para evitar errores de SSR
const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });
const Polyline = dynamic(() => import("react-leaflet").then(mod => mod.Polyline), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), { ssr: false });

// Solución para iconos de Leaflet en Next.js
let L: any;
if (typeof window !== "undefined") {
  L = require("leaflet");
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

export default function InteractiveRoutePreview({ data, onConfirm, onCancel, loading }: any) {
  const [paradas, setParadas] = useState(data.paradas);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const touchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Coordenadas para la línea del mapa (Base + Paradas)
  const polylinePoints = useMemo(() => {
    const points: [number, number][] = [[data.base.lat, data.base.lng]];
    paradas.forEach((p: any) => {
      points.push([p.lat, p.lng]);
    });
    return points;
  }, [paradas, data.base]);

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newParadas = [...paradas];
    const temp = newParadas[index];
    newParadas[index] = newParadas[index - 1];
    newParadas[index - 1] = temp;
    setParadas(newParadas);
  };

  const moveDown = (index: number) => {
    if (index === paradas.length - 1) return;
    const newParadas = [...paradas];
    const temp = newParadas[index];
    newParadas[index] = newParadas[index + 1];
    newParadas[index + 1] = temp;
    setParadas(newParadas);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      const newParadas = [...paradas];
      const draggedItem = newParadas[draggedIndex];
      newParadas.splice(draggedIndex, 1);
      newParadas.splice(dragOverIndex, 0, draggedItem);
      setParadas(newParadas);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Soporte para táctil (mantener presionado)
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>, index: number) => {
    if (touchTimeoutRef.current) clearTimeout(touchTimeoutRef.current);
    // Esperar 300ms para considerarlo un "mantener presionado"
    touchTimeoutRef.current = setTimeout(() => {
      setDraggedIndex(index);
      // Vibrar ligeramente si está soportado
      if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(50);
      }
    }, 300);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (draggedIndex === null) {
      // Si se mueve antes de que se cumpla el tiempo, cancelar el drag
      if (touchTimeoutRef.current) clearTimeout(touchTimeoutRef.current);
      return;
    }
    
    // Prevenir el scroll solo si estamos arrastrando
    if (e.cancelable) {
      e.preventDefault();
    }
    
    const touch = e.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    const item = target?.closest('[data-idx]');
    if (item) {
      const idxStr = item.getAttribute('data-idx');
      if (idxStr !== null) {
        setDragOverIndex(parseInt(idxStr, 10));
      }
    }
  };

  const handleTouchEnd = () => {
    if (touchTimeoutRef.current) clearTimeout(touchTimeoutRef.current);
    if (draggedIndex !== null) {
      handleDragEnd();
    }
  };

  return (
    <div className="flex flex-col h-full gap-4 lg:gap-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl" style={{ marginBottom: '0.25rem' }}>Previsualización de Ruta</h1>
          <p className="text-sm sm:text-base" style={{ color: 'var(--secondary-foreground)' }}>Chofer asignado: <strong>{data.chofer.nombre}</strong></p>
        </div>
        <div className="flex gap-2 sm:gap-4 w-full sm:w-auto">
          <button onClick={onCancel} className="btn btn-secondary flex-1 sm:flex-none justify-center" disabled={loading}>
            <X size={20} /> Cancelar
          </button>
          <button 
            onClick={() => onConfirm(paradas.map((p: any) => p.id))} 
            className="btn btn-primary flex-1 sm:flex-none justify-center" 
            disabled={loading}
          >
            <Check size={20} /> {loading ? "Guardando..." : "Confirmar"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ flex: 1, minHeight: 0 }}>
        {/* Columna de la Lista Ordenable */}
        <div className="lg:col-span-1 flex flex-col gap-4 order-2 lg:order-1 overflow-y-auto" style={{ maxHeight: '70vh' }}>
          <div className="alert flex flex-col sm:flex-row items-start sm:items-center gap-2" style={{ background: 'var(--secondary)', padding: '1rem', borderRadius: 'var(--radius)', fontSize: '0.9rem', color: 'white' }}>
            <div className="flex items-center gap-2 font-semibold">
              <Info size={18} /> Tip:
            </div>
            <span>Mantén click para arrastrar un cliente o usa las flechas.</span>
          </div>

          <div className="flex flex-col gap-3">
            <div className="card" style={{ padding: '0.75rem 1rem', background: 'var(--muted)', opacity: 0.8, border: '1px dashed var(--border)' }}>
              <div className="flex items-center gap-3">
                <div style={{ background: 'var(--primary)', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>H</div>
                <div>
                  <strong>MECH LA BASE</strong>
                  <div style={{ fontSize: '0.8rem' }}>Colectora Presidente Perón 8107</div>
                </div>
              </div>
            </div>

            {paradas.map((p: any, idx: number) => (
              <div 
                key={p.id} 
                data-idx={idx}
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragEnter={(e) => handleDragEnter(e, idx)}
                onDragOver={(e) => e.preventDefault()}
                onDragEnd={handleDragEnd}
                onTouchStart={(e) => handleTouchStart(e, idx)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
                className="card" 
                style={{ 
                  padding: '0.75rem 1rem', 
                  border: dragOverIndex === idx && draggedIndex !== idx ? '2px dashed var(--primary)' : '1px solid var(--border)', 
                  transition: 'all 0.2s',
                  opacity: draggedIndex === idx ? 0.4 : 1,
                  cursor: draggedIndex !== null ? 'grabbing' : 'grab',
                  transform: dragOverIndex === idx && draggedIndex !== idx ? 'scale(1.02)' : 'scale(1)',
                  touchAction: draggedIndex !== null ? 'none' : 'pan-y', // Prevenir scroll al arrastrar
                  position: 'relative',
                  zIndex: draggedIndex === idx ? 10 : 1
                }}
              >
                <div className="flex items-center justify-between gap-4 pointer-events-none">
                  <div className="flex items-center gap-3">
                    <div style={{ background: 'var(--secondary)', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 'bold' }}>
                      {idx + 1}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }} className="text-sm sm:text-base">{p.nombre}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--secondary-foreground)' }}>{p.direccion}</div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 pointer-events-auto">
                    <button 
                      onClick={(e) => { e.stopPropagation(); moveUp(idx); }} 
                      disabled={idx === 0}
                      title="Subir"
                      style={{ padding: '4px', opacity: idx === 0 ? 0.3 : 1, cursor: idx === 0 ? 'default' : 'pointer', background: 'transparent', border: 'none', color: 'var(--foreground)' }}
                    >
                      <ArrowUp size={20} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); moveDown(idx); }} 
                      disabled={idx === paradas.length - 1}
                      title="Bajar"
                      style={{ padding: '4px', opacity: idx === paradas.length - 1 ? 0.3 : 1, cursor: idx === paradas.length - 1 ? 'default' : 'pointer', background: 'transparent', border: 'none', color: 'var(--foreground)' }}
                    >
                      <ArrowDown size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Columna del Mapa */}
        <div className="lg:col-span-2 order-1 lg:order-2 rounded-lg overflow-hidden border border-[var(--border)] relative z-0" style={{ minHeight: '400px', height: '70vh' }}>
          {!mounted ? (
            <div className="w-full h-full flex items-center justify-center bg-[var(--secondary)] text-[var(--secondary-foreground)]">
              Cargando mapa...
            </div>
          ) : (
            <MapContainer 
              center={[data.base.lat, data.base.lng]} 
              zoom={13} 
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                attribution='&copy; Google Maps'
              />
              
              {/* Marcador de la Base */}
              <Marker position={[data.base.lat, data.base.lng]}>
                <Popup><strong>MECH LA BASE:</strong> Colectora Presidente Perón 8107</Popup>
              </Marker>

              {/* Marcadores de Clientes */}
              {paradas.map((p: any, idx: number) => {
                const numIcon = L.divIcon({
                  html: `<div style="background: var(--primary); color: white; border-radius: 50%; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.4);">${idx + 1}</div>`,
                  className: '',
                  iconSize: [26, 26],
                  iconAnchor: [13, 13]
                });
                return (
                  <Marker key={p.id} position={[p.lat, p.lng]} icon={numIcon}>
                    <Popup>
                      <strong>{idx + 1}. {p.nombre}</strong><br />
                      {p.direccion}
                    </Popup>
                  </Marker>
                );
              })}

              {/* Línea del Recorrido */}
              <Polyline 
                positions={polylinePoints} 
                pathOptions={{ color: 'var(--primary)', weight: 4, opacity: 0.7, dashArray: '10, 10' }} 
              />
            </MapContainer>
          )}
        </div>
      </div>
    </div>
  );
}
