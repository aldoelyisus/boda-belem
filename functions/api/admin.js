// Panel de la familia. Acceso con usuario y contraseña sencillos.
// Se pueden cambiar con las variables ADMIN_USER y ADMIN_PASS en Cloudflare
// (Pages > Settings > Variables and Secrets).
//
//   GET    /api/admin              → lista de invitados
//   POST   /api/admin {nombre, acompanantes}       → alta
//   PUT    /api/admin {id, nombre, acompanantes, estado?, asistentes?} → editar
//   DELETE /api/admin?id=abc123    → borrar

import { json, todos, uno, guardar, borrar, nuevoId, cuerpo } from "../../lib/store.js";

function autorizado(request, env) {
  const USER = env.ADMIN_USER || "belem";
  const PASS = env.ADMIN_PASS || "boda2026";
  const h = request.headers.get("Authorization") || "";
  if (!h.startsWith("Basic ")) return false;
  let texto = "";
  try { texto = new TextDecoder().decode(Uint8Array.from(atob(h.slice(6)), c => c.charCodeAt(0))); } catch { return false; }
  const i = texto.indexOf(":");
  const u = texto.slice(0, i), p = texto.slice(i + 1);
  return u.trim().toLowerCase() === USER.toLowerCase() && p === PASS;
}

function limpiar(b) {
  const nombre = String(b.nombre || "").trim().slice(0, 120);
  const acompanantes = Math.max(0, Math.min(20, Math.round(Number(b.acompanantes) || 0)));
  return { nombre, acompanantes };
}

export async function onRequest({ request, env }) {
  if (!autorizado(request, env)) return json({ error: "Usuario o contraseña incorrectos." }, 401);
  const db = env.DB;

  try {
    if (request.method === "GET") return json(await todos(db));

    if (request.method === "POST") {
      const { nombre, acompanantes } = limpiar(await cuerpo(request));
      if (!nombre) return json({ error: "Escribe el nombre del invitado." }, 400);
      const inv = {
        id: await nuevoId(db),
        nombre,
        pases: acompanantes + 1,
        estado: "pendiente",
        asistentes: 0,
        mensaje: "",
        creado: new Date().toISOString(),
        respondido: null,
      };
      await guardar(db, inv);
      return json(inv, 201);
    }

    if (request.method === "PUT") {
      const b = await cuerpo(request);
      const inv = await uno(db, String(b.id || ""));
      if (!inv) return json({ error: "Ese invitado ya no existe." }, 404);
      const { nombre, acompanantes } = limpiar(b);
      if (!nombre) return json({ error: "Escribe el nombre del invitado." }, 400);
      inv.nombre = nombre;
      inv.pases = acompanantes + 1;
      if (["pendiente", "si", "no"].includes(b.estado)) inv.estado = b.estado;
      if (inv.estado === "si") {
        const n = Math.round(Number(b.asistentes ?? inv.asistentes));
        inv.asistentes = Math.max(1, Math.min(inv.pases, n || inv.pases));
      } else {
        inv.asistentes = 0;
      }
      if (inv.estado === "pendiente") inv.respondido = null;
      await guardar(db, inv);
      return json(inv);
    }

    if (request.method === "DELETE") {
      await borrar(db, new URL(request.url).searchParams.get("id") || "");
      return new Response(null, { status: 204 });
    }

    return json({ error: "Método no permitido" }, 405);
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}
