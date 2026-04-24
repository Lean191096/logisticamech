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
    <div className="flex flex-col md:flex-row" style={{ height: '100vh', width: '100vw', overflow: 'hidden', position: 'relative' }}>
      
      {/* Botón flotante para móviles */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 50, background: 'var(--card)', border: '1px solid var(--border)', padding: '0.5rem', borderRadius: '8px', display: 'flex' }}
        className="mobile-menu-btn"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`} style={{ 
        width: '280px', 
        background: 'var(--card)', 
        borderRight: '1px solid var(--border)', 
        display: 'flex', 
        flexDirection: 'column', 
        zIndex: 40, 
        boxShadow: 'var(--shadow-sm)',
        height: '100%',
        position: 'absolute',
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease'
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
          <form action={logoutAdmin}>
            <button type="submit" className="btn" style={{ width: '100%', justifyContent: 'center', background: 'transparent', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
              Salir del Sistema
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, overflowY: 'auto', background: 'var(--background)', width: '100%' }}>
        <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '1400px', width: '100%' }}>
          {children}
        </div>
      </main>

      <style jsx global>{`
        @media (min-width: 768px) {
          .admin-sidebar {
            position: relative !important;
            transform: translateX(0) !important;
          }
          .mobile-menu-btn {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
