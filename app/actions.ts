"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function loginAdmin(formData: FormData) {
  const usuario = formData.get("usuario") as string;
  const clave = formData.get("clave") as string;
  
  if (!prisma.administrador) {
    // Fallback seguro en caso de que el servidor no se haya reiniciado y Prisma no haya detectado la nueva tabla
    if ((usuario.toLowerCase() === "gonzalo" && clave === "123456") || 
        (usuario.toLowerCase() === "leandro" && clave === "1234")) {
      (await cookies()).set("admin_auth", usuario, { 
        path: "/", 
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7 // 1 semana
      });
      return { success: true };
    }
    throw new Error("Usuario o contraseña incorrectos.");
  }

  // Initialize admins if they don't exist
  const adminsDb = await prisma.administrador.findMany();
  if (adminsDb.length === 0) {
    await prisma.administrador.create({
      data: { usuario: "Gonzalo", clave: "123456" }
    });
    await prisma.administrador.create({
      data: { usuario: "Leandro", clave: "1234" }
    });
  } else {
    // Just in case Leandro doesn't exist
    const leandroExists = adminsDb.some(a => a.usuario.toLowerCase() === "leandro");
    if (!leandroExists) {
      await prisma.administrador.create({
        data: { usuario: "Leandro", clave: "1234" }
      });
    }
  }
  
  const admins = await prisma.administrador.findMany();
  const attemptAdmin = admins.find(a => a.usuario.toLowerCase() === usuario.toLowerCase());

  if (attemptAdmin && attemptAdmin.clave === clave) {
    (await cookies()).set("admin_auth", attemptAdmin.usuario, { 
      path: "/", 
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7 // 1 semana
    });
    return { success: true };
  } else {
    throw new Error("Usuario o contraseña incorrectos.");
  }
}

export async function cambiarClaveAdmin(formData: FormData) {
  const usuarioCookie = (await cookies()).get("admin_auth")?.value;
  if (!usuarioCookie) throw new Error("No autenticado.");

  const claveActual = formData.get("claveActual") as string;
  const nuevaClave = formData.get("nuevaClave") as string;
  
  const admin = await prisma.administrador.findUnique({ where: { usuario: usuarioCookie } });
  if (!admin || admin.clave !== claveActual) {
    throw new Error("La contraseña actual es incorrecta.");
  }
  
  await prisma.administrador.update({
    where: { id: admin.id },
    data: { clave: nuevaClave }
  });
  
  revalidatePath('/admin');
  return { success: true };
}

export async function cambiarClaveChofer(formData: FormData) {
  const id = parseInt(formData.get("choferId") as string);
  const nuevaClave = formData.get("nuevaClave") as string;
  
  await prisma.chofer.update({
    where: { id },
    data: { codigo_acceso: nuevaClave }
  });
  
  revalidatePath('/admin/choferes');
  return { success: true };
}


export async function logoutAdmin() {
  (await cookies()).delete("admin_auth");
  redirect("/");
}

export async function marcarEntregado(pedidoId: number, observacion?: string, nextPedidoId?: number) {
  await prisma.pedido.update({
    where: { id: pedidoId },
    data: { estado: 'Entregado' }
  });

  if (observacion) {
    await prisma.$executeRaw`UPDATE Pedido SET observacion = ${observacion} WHERE id = ${pedidoId}`;
  }

  if (nextPedidoId) {
    await prisma.pedido.update({
      where: { id: nextPedidoId },
      data: { estado: 'En Camino' }
    });
  }
  
  revalidatePath('/', 'layout');
}

export async function marcarEnCamino(pedidoId: number) {
  await prisma.pedido.update({
    where: { id: pedidoId },
    data: { estado: 'En Camino' }
  });
  revalidatePath('/', 'layout');
}

export async function marcarNoEntregado(pedidoId: number, observacion: string, nextPedidoId?: number) {
  try {
    await prisma.pedido.update({
      where: { id: pedidoId },
      data: { estado: 'No Entregado' }
    });
    
    if (observacion) {
      await prisma.$executeRaw`UPDATE Pedido SET observacion = ${observacion} WHERE id = ${pedidoId}`;
    }
    
    if (nextPedidoId) {
      await prisma.pedido.update({
        where: { id: nextPedidoId },
        data: { estado: 'En Camino' }
      });
    }

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    console.error("Error al marcar no entregado:", error);
    return { success: false, error: "Ocurrió un error al actualizar. Intenta de nuevo." };
  }
}

export async function crearChofer(formData: FormData) {
  const nombre = formData.get("nombre") as string;
  
  // Generar usuario base (ej: "Juan Perez" -> "jperez" o "juan")
  const partes = nombre.trim().split(" ");
  let baseUsuario = partes[0].toLowerCase();
  if (partes.length > 1) {
    baseUsuario = partes[0].charAt(0).toLowerCase() + partes[partes.length - 1].toLowerCase();
  }
  // Añadir un número aleatorio para evitar colisiones
  const usuario = `${baseUsuario}${Math.floor(Math.random() * 1000)}`;
  
  // Generar clave alfanumérica de 6 caracteres
  const codigo_acceso = Math.random().toString(36).slice(-6).toUpperCase();
  
  try {
    await prisma.chofer.create({
      data: { nombre, usuario, codigo_acceso }
    });
  } catch (error) {
    throw new Error("Ocurrió un error al guardar el chofer.");
  }
  
  revalidatePath('/admin/choferes');
  redirect('/admin/choferes');
}

export async function eliminarChofer(id: number) {
  await prisma.chofer.delete({ where: { id } });
  revalidatePath('/admin/choferes');
}

export async function crearCliente(formData: FormData) {
  const nombre = formData.get("nombre") as string;
  const direccion = formData.get("direccion") as string;
  const telefono = formData.get("telefono") as string;
  const latStr = formData.get("lat") as string;
  const lngStr = formData.get("lng") as string;
  
  if (!latStr || !lngStr || isNaN(parseFloat(latStr)) || isNaN(parseFloat(lngStr))) {
    throw new Error("Error: Debes seleccionar una ubicación en el mapa para el cliente (el pin rojo debe aparecer en el mapa). Por favor, vuelve atrás e inténtalo de nuevo.");
  }

  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);
  
  // Guardamos el telefono junto con la direccion temporalmente para que no de error
  // hasta que se reinicie el servidor de base de datos
  const direccionConTel = telefono ? `${direccion} (Tel: ${telefono})` : direccion;
  
  await prisma.cliente.create({
    data: { nombre, direccion: direccionConTel, lat, lng }
  });
  
  revalidatePath('/admin/clientes');
  redirect('/admin/clientes');
}

export async function eliminarCliente(id: number) {
  await prisma.cliente.delete({ where: { id } });
  revalidatePath('/admin/clientes');
}

export async function actualizarCliente(id: number, formData: FormData) {
  const nombre = formData.get("nombre") as string;
  const direccion = formData.get("direccion") as string;
  const telefono = formData.get("telefono") as string;
  
  const latStr = formData.get("lat") as string;
  const lngStr = formData.get("lng") as string;
  
  const direccionConTel = telefono ? `${direccion} (Tel: ${telefono})` : direccion;
  
  const dataToUpdate: any = { nombre, direccion: direccionConTel };
  if (latStr && lngStr && !isNaN(parseFloat(latStr)) && !isNaN(parseFloat(lngStr))) {
    dataToUpdate.lat = parseFloat(latStr);
    dataToUpdate.lng = parseFloat(lngStr);
  }

  await prisma.cliente.update({
    where: { id },
    data: dataToUpdate
  });
  
  revalidatePath('/admin/clientes');
  redirect('/admin/clientes');
}

export async function generarRutaAction() {
  const { generarRutaOptima } = await import('@/lib/routing');
  const result = await generarRutaOptima();
  revalidatePath('/admin/rutas');
  return result;
}

export async function previsualizarRuta(formData: FormData) {
  const choferId = parseInt(formData.get("chofer_id") as string);
  const clientesIdsStr = formData.getAll("clientes").map(id => parseInt(id as string));
  
  if (clientesIdsStr.length === 0) {
    throw new Error("Debes seleccionar al menos un cliente para generar la ruta.");
  }
  
  const { previsualizarRutaTSP } = await import('@/lib/routing');
  const result = await previsualizarRutaTSP(choferId, clientesIdsStr);
  
  if (result.error) {
    throw new Error(result.error);
  }
  
  return result;
}

export async function guardarRutaConfirmada(choferId: number, orderedClientesIds: number[]) {
  // Para cada cliente en el orden confirmado, creamos un Pedido
  const pedidosCreados = [];
  for (const cliente_id of orderedClientesIds) {
    const pedido = await prisma.pedido.create({
      data: {
        cliente_id,
        estado: 'Pendiente'
      }
    });
    pedidosCreados.push(pedido);
  }

  const pedidosIdsStr = pedidosCreados.map(p => p.id);

  // Crear la ruta
  const ruta = await prisma.ruta.create({
    data: {
      chofer_id: choferId,
      orden_paradas: JSON.stringify(pedidosIdsStr),
    }
  });

  // Asignar ruta a los pedidos
  for (const pedidoId of pedidosIdsStr) {
    await prisma.pedido.update({
      where: { id: pedidoId },
      data: { ruta_id: ruta.id }
    });
  }

  revalidatePath('/admin/rutas');
  redirect('/admin/rutas');
}

export async function loginChofer(formData: FormData) {
  const usuario = formData.get("usuario") as string;
  const clave = formData.get("clave") as string;
  
  const chofer = await prisma.chofer.findUnique({
    where: { usuario }
  });
  
  if (chofer && chofer.codigo_acceso === clave) {
    redirect(`/chofer/${chofer.id}/ruta`);
  } else {
    throw new Error("Usuario o clave incorrectos.");
  }
}

export async function crearPedidoDePrueba() {
  const cliente = await prisma.cliente.findFirst();
  if (!cliente) return;
  await prisma.pedido.create({
    data: {
      cliente_id: cliente.id,
      estado: 'Pendiente'
    }
  });
  revalidatePath('/admin/pedidos');
}
