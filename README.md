# Boda Belém & Rubén

Invitación de boda con confirmación de asistencia por invitado y pase de entrada.
Hecha para Cloudflare Pages con base de datos D1, ambas en el plan gratis (igual que XV Rachell).

- `/` es la invitación general, sin confirmación.
- `/i/<código>` es la invitación personal: saluda al invitado por su nombre y permite confirmar.
  Al confirmar que sí asiste, aparece su **pase de entrada** (nombre y total de personas) y lo puede guardar como imagen.
- `/admin` es el panel de los novios. Usuario `belem`, contraseña `boda2026`.

## Estructura

- `public/`: lo que se publica (`index.html`, `admin.html`, `img/`, `audio/`, `_redirects`).
- `functions/api/`: las funciones `invitado.js` y `admin.js`.
- `lib/store.js`: el acceso a la base de datos.
- `schema.sql`: la tabla `invitados`.
- `wrangler.toml`: la configuración de Cloudflare (proyecto y base `boda-belem`).
- `img/` y `audio/` (en la raíz): los originales que mandaron los novios. Las copias que usa la página están en `public/`.

## Probar en local

```
npm run dev
```

Abre http://localhost:8788/admin. En local se usa una copia de la base en `.wrangler/`, no la real.
La primera vez, crea la tabla local con:

```
npx wrangler@4 d1 execute boda-belem --local --file=schema.sql
```

## Publicar (primera vez)

1. `npx wrangler@4 d1 create boda-belem` y pega el `database_id` que devuelve en `wrangler.toml`.
2. `npx wrangler@4 d1 execute boda-belem --remote --file=schema.sql`
3. `npm run deploy`

Después, para publicar cambios basta `npm run deploy`.

## Cambiar usuario y contraseña

En el panel de Cloudflare, ve a Workers & Pages > boda-belem > Settings > Variables and Secrets.
Agrega `ADMIN_USER` y `ADMIN_PASS`, y vuelve a publicar.
