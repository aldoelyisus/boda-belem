CREATE TABLE IF NOT EXISTS invitados (
  id          TEXT PRIMARY KEY,
  nombre      TEXT NOT NULL,
  pases       INTEGER NOT NULL,
  estado      TEXT NOT NULL DEFAULT 'pendiente',
  asistentes  INTEGER NOT NULL DEFAULT 0,
  mensaje     TEXT NOT NULL DEFAULT '',
  creado      TEXT NOT NULL,
  respondido  TEXT
);
