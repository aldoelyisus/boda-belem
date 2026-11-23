// Endpoint público del invitado.
//   GET  /api/invitado?id=abc123        → sus datos (nombre, pases, respuesta)
//   POST /api/invitado {id, asiste, asistentes, mensaje} → guarda su respuesta

import { json, uno, guardar, publico, cuerpo } from "../../lib/store.js";

const NO_EXISTE = { error: "No encontramos esta invitación." };

export async function onRequestGet({ request, env }) {
  const id = (new URL(request.url).searchParams.get("id") || "").toLowerCase();
  const inv = id && (await uno(env.DB, id));
  if (!inv) return json(NO_EXISTE, 404);
  return json(publico(inv));
}

export async function onRequestPost({ request, env }) {
  const b = await cuerpo(request);
  const id = String(b.id || "").toLowerCase();
  const inv = id && (await uno(env.DB, id));
  if (!inv) return json(NO_EXISTE, 404);

  if (b.asiste) {
    const n = Math.round(Number(b.asistentes));
    if (!(n >= 1 && n <= inv.pases)) return json({ error: `Elige entre 1 y ${inv.pases} personas.` }, 400);
    inv.estado = "si";
    inv.asistentes = n;
  } else {
    inv.estado = "no";
    inv.asistentes = 0;
  }
  inv.mensaje = String(b.mensaje || "").slice(0, 500);
  inv.respondido = new Date().toISOString();
  await guardar(env.DB, inv);
  return json(publico(inv));
}
