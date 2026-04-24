"use client";

import { useState } from "react";
import { MapPin, CheckCircle, Navigation, XCircle } from "lucide-react";
import { marcarEntregado, marcarNoEntregado } from "@/app/actions";

export default function RutaClient({ paradas, currentIndex: initialIndex, choferNombre = "" }: { paradas: any[], currentIndex: number, choferNombre?: string }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [loading, setLoading] = useState(false);
  const [observacion, setObservacion] = useState("");

  const handleCompletar = async (pedidoId: number) => {
    setLoading(true);
    const nextParada = paradas[currentIndex + 1];
    await marcarEntregado(pedidoId, observacion, nextParada?.id);
    setLoading(false);
    setObservacion("");
    setCurrentIndex(prev => prev + 1);
  };

  const handleNoEntregado = async (pedidoId: number) => {
    if (!observacion.trim()) {
      alert("Por favor, ingresa una observación para indicar por qué no se entregó.");
      return;
    }
    setLoading(true);
    const nextParada = paradas[currentIndex + 1];
    const result = await marcarNoEntregado(pedidoId, observacion, nextParada?.id);
    setLoading(false);

    if (result && !result.success) {
      alert(result.error);
      return;
    }

    setObservacion("");
    setCurrentIndex(prev => prev + 1);
  };

  const currentParada = paradas[currentIndex];

  // Extraer el teléfono si lo habíamos metido en la dirección por el fix temporal
  let phoneToUse = currentParada?.cliente?.telefono;
  let cleanAddress = currentParada?.cliente?.direccion;
  if (!phoneToUse && cleanAddress) {
    const telMatch = cleanAddress.match(/\(Tel: (.*?)\)/);
    if (telMatch) {
      phoneToUse = telMatch[1];
      cleanAddress = cleanAddress.replace(/\(Tel: .*?\)/, '').trim();
    }
  }

  const handleIniciarNavegacion = (app: 'maps' | 'waze') => {
    if (!currentParada) return;

    const lat = currentParada.cliente.lat;
    const lng = currentParada.cliente.lng;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    let gpsUrl = "";
    if (app === 'waze') {
      gpsUrl = `waze://?ll=${lat},${lng}&navigate=yes`;
    } else {
      if (isIOS) {
        gpsUrl = `comgooglemaps://?daddr=${lat},${lng}&directionsmode=driving`;
      } else {
        gpsUrl = `google.navigation:q=${lat},${lng}`;
      }
    }

    let waUrl = "";
    if (phoneToUse) {
      let num = phoneToUse.replace(/[^0-9]/g, '');
      if (num.startsWith('0')) num = num.substring(1);
      
      if (num.length === 10) num = '549' + num;
      else if (num.length === 12 && num.startsWith('54') && num[2] !== '9') num = '549' + num.substring(2);
      else if (num.length === 11 && num.startsWith('549')) { /* Faltan digitos pero lo intentamos igual */ }
      else if (!num.startsWith('54')) num = '549' + num;
      
      let textoBase = `Hola ${currentParada.cliente.nombre}, ${choferNombre} de Logística Mech se encuentra en camino a su domicilio. Ante cualquier duda comuníquese de inmediato para resolver su inconveniente.`;
      const text = encodeURIComponent(textoBase);
      waUrl = `whatsapp://send?phone=${num}&text=${text}`;
    }

    // Usar 'a.click()' evita modificar window.location y previene el error "Reload" en Next.js
    const launchUrl = (url: string) => {
      const a = document.createElement('a');
      a.href = url;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };

    if (waUrl) {
      launchUrl(waUrl); // 1. Abre WhatsApp (Nativo)
      
      // 2. El celular bloquea abrir dos apps a la vez si una está en segundo plano.
      // Solución: Esperamos a que el chofer vuelva a nuestra app (cierre WhatsApp) y ahí disparamos el GPS.
      const onFocus = () => {
        document.removeEventListener('visibilitychange', onVisibilityChange);
        window.removeEventListener('focus', onFocus);
        // Pequeña pausa para que la pantalla termine de cargar y lanzamos el GPS
        setTimeout(() => launchUrl(gpsUrl), 400);
      };
      
      const onVisibilityChange = () => {
        if (document.visibilityState === 'visible') onFocus();
      };

      document.addEventListener('visibilitychange', onVisibilityChange);
      window.addEventListener('focus', onFocus);
      
      // Limpieza de seguridad por si no vuelven
      setTimeout(() => {
        document.removeEventListener('visibilitychange', onVisibilityChange);
        window.removeEventListener('focus', onFocus);
      }, 120000);
    } else {
      launchUrl(gpsUrl);
    }

    // Background task
    setLoading(true);
    import("@/app/actions").then(({ marcarEnCamino }) => {
      marcarEnCamino(currentParada.id).finally(() => setLoading(false));
    }).catch(() => setLoading(false));
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '100%', overflowX: 'hidden' }}>
      {currentParada ? (
        <div className="card" style={{ marginBottom: '2rem', border: '2px solid var(--primary)', borderRadius: '12px', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
          <div className="flex justify-between items-center mb-4">
            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Siguiente Destino</h3>
            <span className="badge badge-warning" style={{ fontSize: '0.9rem', padding: '0.4rem 0.8rem', borderRadius: '20px' }}>
              {currentIndex + 1} de {paradas.length}
            </span>
          </div>

          <div style={{ marginBottom: '1.5rem', background: 'var(--muted)', padding: '1rem', borderRadius: '8px' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--foreground)' }}>{currentParada.cliente.nombre}</h2>
            {phoneToUse && (
              <p style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: '0.5rem', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                </svg>
                {phoneToUse}
              </p>
            )}
            <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--secondary-foreground)', fontSize: '1rem', lineHeight: 1.4 }}>
              <MapPin size={18} style={{ flexShrink: 0, marginTop: '2px', alignSelf: 'flex-start' }} />
              {cleanAddress}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => handleIniciarNavegacion('maps')}
                disabled={loading}
                className="btn flex-1 flex flex-col justify-center items-center gap-1"
                style={{ padding: '0.8rem', fontSize: '1rem', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px', boxShadow: '0 4px 10px rgba(59, 130, 246, 0.3)' }}
              >
                <div className="flex items-center gap-2">
                  <Navigation size={18} />
                  <span>Maps</span>
                </div>
                <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>+ WhatsApp</span>
              </button>

              <button
                onClick={() => handleIniciarNavegacion('waze')}
                disabled={loading}
                className="btn flex-1 flex flex-col justify-center items-center gap-1"
                style={{ padding: '0.8rem', fontSize: '1rem', background: '#33ccff', color: '#fff', border: 'none', borderRadius: '8px', boxShadow: '0 4px 10px rgba(51, 204, 255, 0.3)' }}
              >
                <div className="flex items-center gap-2">
                  <Navigation size={18} />
                  <span style={{ color: '#000', fontWeight: 600 }}>Waze</span>
                </div>
                <span style={{ fontSize: '0.8rem', opacity: 0.9, color: '#000' }}>+ WhatsApp</span>
              </button>
            </div>

            <div style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Observaciones / Motivo:</label>
              <textarea
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
                placeholder="Ej: Timbre roto, dejé el paquete en..."
                className="input"
                style={{ width: '100%', minHeight: '80px', borderColor: (!observacion.trim() ? 'var(--border)' : 'var(--primary)') }}
              />
              {!observacion.trim() && (
                <small style={{ color: 'var(--danger)', display: 'block', marginTop: '0.35rem', fontWeight: 600 }}>
                  * Obligatorio para marcar como &quot;No Entregado&quot;
                </small>
              )}
            </div>

            <button
              onClick={() => handleCompletar(currentParada.id)}
              disabled={loading}
              className="btn btn-primary w-full"
              style={{ padding: '1rem', fontSize: '1.1rem', background: 'var(--success)' }}
            >
              <CheckCircle size={24} />
              {loading ? 'Actualizando...' : 'Entrega Finalizada'}
            </button>
            <button
              onClick={() => handleNoEntregado(currentParada.id)}
              disabled={loading || !observacion.trim()}
              className="btn btn-primary w-full"
              style={{ padding: '1rem', fontSize: '1.1rem', background: 'var(--danger)', opacity: (!observacion.trim() ? 0.5 : 1) }}
            >
              <XCircle size={24} />
              Pedido Rechazado / No Entregado
            </button>
          </div>
        </div>
      ) : (
        <div className="card text-center" style={{ padding: '3rem 1rem', background: 'var(--success)', color: 'white' }}>
          <CheckCircle size={64} style={{ margin: '0 auto', marginBottom: '1rem' }} />
          <h2>¡Ruta Completada!</h2>
          <p>Has finalizado todas las entregas del día.</p>
        </div>
      )}

      <h3 style={{ marginBottom: '1rem' }}>Próximas Paradas</h3>
      <div className="flex flex-col gap-3">
        {paradas.slice(currentIndex + 1).map((p, idx) => (
          <div key={p.id} className="card" style={{ padding: '1rem', opacity: 0.8 }}>
            <div className="flex justify-between items-center">
              <div>
                <strong>{currentIndex + 2 + idx}. {p.cliente.nombre}</strong>
                <div style={{ fontSize: '0.875rem', color: 'var(--secondary-foreground)' }}>{p.cliente.direccion}</div>
              </div>
            </div>
          </div>
        ))}

        {paradas.slice(currentIndex + 1).length === 0 && currentParada && (
          <p style={{ color: 'var(--secondary-foreground)', textAlign: 'center' }}>No hay más paradas.</p>
        )}
      </div>
    </div>
  );
}
