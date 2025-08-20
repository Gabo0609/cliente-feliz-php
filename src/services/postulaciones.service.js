import { withTx } from "../db/tx.js";
import { pool } from "../db/pool.js";

const ESTADOS = [
  "POSTULANDO",
  "REVISANDO",
  "ENTREVISTA_PSICO",
  "ENTREVISTA_PERSONAL",
  "SELECCIONADO",
  "DESCARTADO",
];

export async function crearPostulacion({ oferta_id, postulante }) {
  return withTx(async (client) => {
    // upsert postulante por email
    const { rows: postulanteRows } = await client.query(
      `INSERT INTO postulantes (nombre, email, telefono)
       VALUES ($1,$2,$3)
       ON CONFLICT (email)
       DO UPDATE SET nombre = EXCLUDED.nombre,
                     telefono = EXCLUDED.telefono
       RETURNING id, nombre, email, telefono`,
      [postulante.nombre, postulante.email, postulante.telefono ?? null]
    );
    const p = postulanteRows[0];

    try {
      const { rows } = await client.query(
        `INSERT INTO postulaciones (oferta_id, postulante_id)
         VALUES ($1,$2)
         RETURNING *`,
        [oferta_id, p.id]
      );
      return { postulacion: rows[0], postulante: p };
    } catch (err) {
      // 23505: unique_violation (ya postuló a esa oferta)
      if (err.code === "23505") {
        const e = new Error("El postulante ya postuló a esta oferta.");
        e.status = 409;
        throw e;
      }
      // 23503: foreign_key_violation (oferta no existe)
      if (err.code === "23503") {
        const e = new Error("La oferta indicada no existe.");
        e.status = 404;
        throw e;
      }
      throw err;
    }
  });
}

export async function cambiarEstado(id, { estado_nuevo, comentario = null }) {
  if (!ESTADOS.includes(estado_nuevo)) {
    const e = new Error("Estado inválido");
    e.status = 422;
    throw e;
  }

  return withTx(async (client) => {
    // existe la postulación?
    const { rows: ex } = await client.query(
      `SELECT id, estado FROM postulaciones WHERE id = $1`,
      [id]
    );
    if (!ex[0]) {
      const e = new Error("Postulación no encontrada");
      e.status = 404;
      throw e;
    }

    // update estado
    const { rows: upd } = await client.query(
      `UPDATE postulaciones SET estado = $1 WHERE id = $2 RETURNING *`,
      [estado_nuevo, id]
    );

    // historial
    const { rows: hist } = await client.query(
      `INSERT INTO cambios_estado (postulacion_id, estado_nuevo, comentario)
       VALUES ($1,$2,$3) RETURNING *`,
      [id, estado_nuevo, comentario]
    );

    return { postulacion: upd[0], cambio: hist[0] };
  });
}

export async function obtenerHistorial(id) {
  const { rows: post } = await pool.query(
    `SELECT p.* FROM postulaciones p WHERE p.id = $1`,
    [id]
  );
  if (!post[0]) return null;

  const { rows: cambios } = await pool.query(
    `SELECT id, estado_nuevo, comentario, created_at
     FROM cambios_estado
     WHERE postulacion_id = $1
     ORDER BY created_at ASC`,
    [id]
  );

  return { postulacion: post[0], cambios };
}
