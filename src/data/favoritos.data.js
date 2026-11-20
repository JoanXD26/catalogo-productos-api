const pool = require('../config/database');

async function listarFavoritos(usuarioId) {
  const { rows } = await pool.query(
    `SELECT p.id, p.nombre, p.descripcion, p.categoria, p.precio
     FROM favoritos AS f
     JOIN productos AS p ON p.id = f.producto_id
     WHERE f.usuario_id = $1
     ORDER BY p.id`,
    [usuarioId]
  );
  return rows;
}

async function agregarFavorito(usuarioId, productoId) {
  const { rows: [favorito] } = await pool.query(
    `INSERT INTO favoritos (usuario_id, producto_id)
     VALUES ($1, $2)
     ON CONFLICT ON CONSTRAINT favoritos_pk DO NOTHING
     RETURNING producto_id AS "productoId"`,
    [usuarioId, productoId]
  );
  return favorito;
}

async function eliminarFavorito(usuarioId, productoId) {
  const { rows: [favorito] } = await pool.query(
    `DELETE FROM favoritos
     WHERE usuario_id = $1 AND producto_id = $2
     RETURNING producto_id AS "productoId"`,
    [usuarioId, productoId]
  );
  return favorito;
}

module.exports = { listarFavoritos, agregarFavorito, eliminarFavorito };