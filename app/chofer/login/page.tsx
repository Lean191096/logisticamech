import { Truck } from "lucide-react";
import { loginChofer } from "@/app/actions";

export default function ChoferLogin() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <div className="card text-center" style={{ maxWidth: '350px', width: '100%' }}>
        <img 
          src="https://mech.com.ar/wp-content/uploads/2021/09/LOGO-PNG.png" 
          alt="Mech Logística Logo" 
          style={{ maxWidth: '180px', margin: '0 auto 1.5rem auto', display: 'block' }} 
        />
        <h2 className="mb-6">Portal de Chofer</h2>
        
        <form action={loginChofer} className="flex flex-col gap-4">
          <div>
            <input 
              type="text" 
              name="usuario"
              className="input text-center text-xl" 
              placeholder="Usuario" 
              required
            />
          </div>
          <div>
            <input 
              type="password" 
              name="clave"
              className="input text-center text-xl tracking-widest" 
              placeholder="Clave de 6 dígitos" 
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-full" style={{ padding: '0.75rem', fontSize: '1.1rem' }}>
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}
