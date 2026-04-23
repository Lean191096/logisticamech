import { redirect } from "next/navigation";

export default function Home() {
  // Redirigir automáticamente al panel administrativo como solicitó el usuario
  redirect("/admin/login");
}

