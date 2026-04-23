export default function AdminDashboard() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1>Dashboard</h1>
      </div>
      
      <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <div className="card">
          <h3 className="mb-2">Bienvenido a Mech Logística</h3>
          <p style={{ color: 'var(--secondary-foreground)', opacity: 0.8 }}>
            Utiliza el menú lateral para navegar por las distintas secciones.
          </p>
        </div>
      </div>
    </div>
  );
}
