import { pool } from "../db/pool.js";

export async function crearOferta({ titulo, descripcion, location = null }) {
  const { rows } = await pool.query(
    `INSERT INTO ofertas (titulo, descripcion, location)
     VALUES ($1,$2,$3)
     RETURNING *`,
    [titulo, descripcion, location]
  );
  return rows[0];
}

export async function listarOfertas({
  page = 1,
  limit = 10,
  search = "",
  activas,
}) {
  const offset = (page - 1) * limit;
  const params = [];
  const where = [];

  if (search) {
    params.push(`%${search}%`);
    where.push(
      `(titulo ILIKE $${params.length} OR descripcion ILIKE $${params.length})`
    );
  }
  if (activas === true) where.push("is_active = true");
  if (activas === false) where.push("is_active = false");

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  params.push(limit, offset);

  const { rows } = await pool.query(
    `SELECT *
     FROM ofertas
     ${whereSql}
     ORDER BY created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  return rows;
}

export async function actualizarOferta(id, fields = {}) {
  const permitidos = ["titulo", "descripcion", "location", "is_active"];
  const entries = Object.entries(fields).filter(
    ([k, v]) => permitidos.includes(k) && v !== undefined
  );

  if (entries.length === 0) return null;

  const sets = entries.map(([k], i) => `${k} = $${i + 1}`);
  const vals = entries.map(([, v]) => v);
  vals.push(id);

  const { rows } = await pool.query(
    `UPDATE ofertas SET ${sets.join(", ")} WHERE id = $${vals.length} RETURNING *`,
    vals
  );
  return rows[0] || null;
}

export async function desactivarOferta(id) {
  const { rowCount } = await pool.query(
    `UPDATE ofertas SET is_active = false WHERE id = $1`,
    [id]
  );
  return rowCount > 0;
}

export async function listarPostulantesDeOferta(ofertaId) {
  const { rows } = await pool.query(
    `SELECT po.id AS postulacion_id,
            ps.id AS postulante_id,
            ps.nombre,
            ps.email,
            ps.telefono,
            po.estado,
            po.created_at AS postulacion_fecha
     FROM postulaciones po
     JOIN postulantes ps ON ps.id = po.postulante_id
     WHERE po.oferta_id = $1
     ORDER BY po.created_at DESC`,
    [ofertaId]
  );
  return rows;
}
