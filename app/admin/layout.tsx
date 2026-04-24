"use client";

import Link from "next/link";
import { Users, MapPin, Package, LayoutDashboard, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { logoutAdmin } from "@/app/actions";
import { useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Si estamos en la página de login, ocultar todo el marco del panel de administración
  if (pathname === "/admin/login") {
    return <main style={{ width: '100vw', minHeight: '100vh', backgroundColor: '#ffffff' }}>{children}</main>;
  }

  return (
    <div className="admin-layout-container flex" style={{ height: '100vh', width: '100vw', overflow: 'hidden', position: 'relative' }}>
      
      {/* Botón flotante para móviles */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 50, background: 'var(--card)', border: '1px solid var(--border)', padding: '0.5rem', borderRadius: '8px' }}
        className="mobile-menu-btn flex"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`} style={{ 
        width: '280px', 
        background: 'var(--card)', 
        borderRight: '1px solid var(--border)', 
        display: 'flex', 
        flexDirection: 'column', 
        boxShadow: 'var(--shadow-sm)',
        height: '100%'
      }}>
        <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
          <img 
            src="https://mech.com.ar/wp-content/uploads/2021/09/LOGO-PNG.png" 
            alt="Mech Logística Logo" 
            style={{ maxWidth: '150px', display: 'block' }} 
          />
        </div>
        
        <nav style={{ padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, overflowY: 'auto' }}>
          <Link onClick={() => setSidebarOpen(false)} href="/admin" className="btn" style={{ justifyContent: 'flex-start', padding: '0.85rem 1rem', fontSize: '1rem', background: 'transparent', color: 'var(--foreground)' }}>
            <LayoutDashboard size={20} style={{ color: 'var(--primary)' }} /> Dashboard
          </Link>
          <Link onClick={() => setSidebarOpen(false)} href="/admin/choferes" className="btn" style={{ justifyContent: 'flex-start', padding: '0.85rem 1rem', fontSize: '1rem', background: 'transparent', color: 'var(--foreground)' }}>
            <Users size={20} style={{ color: 'var(--primary)' }} /> Choferes
          </Link>
          <Link onClick={() => setSidebarOpen(false)} href="/admin/clientes" className="btn" style={{ justifyContent: 'flex-start', padding: '0.85rem 1rem', fontSize: '1rem', background: 'transparent', color: 'var(--foreground)' }}>
            <Users size={20} style={{ color: 'var(--primary)' }} /> Clientes
          </Link>
          <Link onClick={() => setSidebarOpen(false)} href="/admin/rutas" className="btn" style={{ justifyContent: 'flex-start', padding: '0.85rem 1rem', fontSize: '1rem', background: 'transparent', color: 'var(--foreground)' }}>
            <MapPin size={20} style={{ color: 'var(--primary)' }} /> Rutas & Seguimiento
          </Link>
          <Link onClick={() => setSidebarOpen(false)} href="/admin/configuracion" className="btn" style={{ justifyContent: 'flex-start', padding: '0.85rem 1rem', fontSize: '1rem', background: 'transparent', color: 'var(--foreground)' }}>
            <Package size={20} style={{ color: 'var(--primary)' }} /> Configuración
          </Link>
        </nav>
        
        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', background: 'var(--background)' }}>
          <button 
            onClick={async () => {
              await logoutAdmin();
              window.location.href = "/";
            }}
            className="btn btn-logout" 
            style={{ width: '100%', justifyContent: 'center' }}>
            Salir del Sistema
          </button>
        </div>
      </aside>

      {/* Overlay oscuro para móviles */}
      {sidebarOpen && (
        <div 
          className="mobile-overlay" 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 30 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main style={{ flex: 1, overflowY: 'auto', background: 'var(--background)' }}>
        <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '1400px' }}>
          {children}
        </div>
      </main>

      {/* CSS Seguro para Responsividad */}
      <style dangerouslySetInnerHTML={{__html: `
        @media (min-width: 769px) {
          .admin-layout-container {
            flex-direction: row !important;
          }
          .admin-sidebar {
            position: relative !important;
            transform: translateX(0) !important;
            z-index: 10;
          }
          .mobile-menu-btn {
            display: none !important;
          }
          .mobile-overlay {
            display: none !important;
          }
        }
        
        @media (max-width: 768px) {
          .admin-layout-container {
            flex-direction: column !important;
          }
          .admin-sidebar {
            position: absolute !important;
            transform: translateX(0);
            transition: transform 0.3s ease;
            z-index: 40;
          }
          .admin-sidebar.closed {
            transform: translateX(-100%) !important;
          }
        }
      `}} />
    </div>
  );
}
