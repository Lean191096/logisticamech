import { Truck } from "lucide-react";
import { loginChofer } from "@/app/actions";

export default function ChoferLogin() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen" style={{ backgroundColor: '#ffffff', padding: '1rem' }}>
      <div style={{ maxWidth: '350px', width: '100%', padding: '2.5rem 1.5rem', border: '1px solid #eaeaea', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', textAlign: 'center' }}>
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
