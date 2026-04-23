import Link from "next/link";
import { Users, MapPin, Package, LayoutDashboard } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex" style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside style={{ width: '280px', background: 'var(--card)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', zIndex: 10, boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
          <img 
            src="https://mech.com.ar/wp-content/uploads/2021/09/LOGO-PNG.png" 
            alt="Mech Logística Logo" 
            style={{ maxWidth: '150px', display: 'block' }} 
          />
        </div>
        
        <nav style={{ padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, overflowY: 'auto' }}>
          <Link href="/admin" className="btn" style={{ justifyContent: 'flex-start', padding: '0.85rem 1rem', fontSize: '1rem', background: 'transparent', color: 'var(--foreground)' }}>
            <LayoutDashboard size={20} style={{ color: 'var(--primary)' }} /> Dashboard
          </Link>
          <Link href="/admin/choferes" className="btn" style={{ justifyContent: 'flex-start', padding: '0.85rem 1rem', fontSize: '1rem', background: 'transparent', color: 'var(--foreground)' }}>
            <Users size={20} style={{ color: 'var(--primary)' }} /> Choferes
          </Link>
          <Link href="/admin/clientes" className="btn" style={{ justifyContent: 'flex-start', padding: '0.85rem 1rem', fontSize: '1rem', background: 'transparent', color: 'var(--foreground)' }}>
            <Users size={20} style={{ color: 'var(--primary)' }} /> Clientes
          </Link>
          <Link href="/admin/rutas" className="btn" style={{ justifyContent: 'flex-start', padding: '0.85rem 1rem', fontSize: '1rem', background: 'transparent', color: 'var(--foreground)' }}>
            <MapPin size={20} style={{ color: 'var(--primary)' }} /> Rutas & Seguimiento
          </Link>
          <Link href="/admin/configuracion" className="btn" style={{ justifyContent: 'flex-start', padding: '0.85rem 1rem', fontSize: '1rem', background: 'transparent', color: 'var(--foreground)' }}>
            <Package size={20} style={{ color: 'var(--primary)' }} /> Configuración
          </Link>
        </nav>
        
        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', background: 'var(--background)' }}>
          <form action={async () => {
            "use server";
            const { logoutAdmin } = await import("@/app/actions");
            await logoutAdmin();
          }}>
            <button type="submit" className="btn" style={{ width: '100%', justifyContent: 'center', background: 'transparent', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
              Salir del Sistema
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, overflowY: 'auto', background: 'var(--background)' }}>
        <div className="container" style={{ padding: '3rem 2rem', maxWidth: '1400px' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
