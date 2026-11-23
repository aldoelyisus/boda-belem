// Acceso a la base de datos D1 de Cloudflare (binding "DB" en wrangler.toml).
// La tabla se crea con schema.sql.

export const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });

const desdeFila = f => f && ({
  id: f.id,
  nombre: f.nombre,
  pases: f.pases,
  estado: f.estado,
  asistentes: f.asistentes,
  mensaje: f.mensaje || "",
  creado: f.creado,
  respondido: f.respondido,
});

export async function todos(db) {
  const { results } = await db.prepare("SELECT * FROM invitados ORDER BY creado DESC").all();
  return results.map(desdeFila);
}

export async function uno(db, id) {
  return desdeFila(await db.prepare("SELECT * FROM invitados WHERE id = ?").bind(id).first());
}

export async function guardar(db, inv) {
  await db.prepare(
    `INSERT INTO invitados (id, nombre, pases, estado, asistentes, mensaje, creado, respondido)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
     ON CONFLICT(id) DO UPDATE SET nombre = ?2, pases = ?3, estado = ?4, asistentes = ?5,
       mensaje = ?6, respondido = ?8`
  ).bind(inv.id, inv.nombre, inv.pases, inv.estado, inv.asistentes, inv.mensaje || "", inv.creado, inv.respondido ?? null).run();
  return inv;
}

export async function borrar(db, id) {
  await db.prepare("DELETE FROM invitados WHERE id = ?").bind(id).run();
}

// Código corto para la URL. Sin 0/O, 1/l/I: se dictan por teléfono sin confusión.
const ABC = "abcdefghjkmnpqrstuvwxyz23456789";
export async function nuevoId(db) {
  for (;;) {
    const bytes = crypto.getRandomValues(new Uint8Array(6));
    const id = Array.from(bytes, b => ABC[b % ABC.length]).join("");
    if (!(await uno(db, id))) return id;
  }
}

// Lo que el invitado puede ver de sí mismo.
export const publico = inv => ({
  id: inv.id,
  nombre: inv.nombre,
  pases: inv.pases,
  estado: inv.estado,
  asistentes: inv.asistentes,
  mensaje: inv.mensaje || "",
});

export async function cuerpo(request) {
  try { return await request.json(); } catch { return {}; }
}
