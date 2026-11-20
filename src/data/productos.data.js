const pool = require('../config/database');

const columnas = 'id, nombre, descripcion, categoria, precio';

async function listarProductos(categoria) {
  const { rows } = await pool.query(
    `SELECT ${columnas}
     FROM productos
     WHERE $1::text IS NULL OR categoria = $1
     ORDER BY id`,
    [categoria]
  );
  return rows;
}

async function buscarProductoPorId(id) {
  const { rows: [producto] } = await pool.query(
    `SELECT ${columnas} FROM productos WHERE id = $1`,
    [id]
  );
  return producto;
}

async function crearProducto({ nombre, descripcion, categoria, precio }) {
  const { rows: [producto] } = await pool.query(
    `INSERT INTO productos (nombre, descripcion, categoria, precio)
     VALUES ($1, $2, $3, $4)
     RETURNING ${columnas}`,
    [nombre, descripcion, categoria, precio]
  );
  return producto;
}

async function actualizarProducto(id, { nombre, descripcion, categoria, precio }) {
  const { rows: [producto] } = await pool.query(
    `UPDATE productos
     SET nombre = $1, descripcion = $2, categoria = $3, precio = $4
     WHERE id = $5
     RETURNING ${columnas}`,
    [nombre, descripcion, categoria, precio, id]
  );
  return producto;
}

async function eliminarProducto(id) {
  const { rows: [producto] } = await pool.query(
    'DELETE FROM productos WHERE id = $1 RETURNING id',
    [id]
  );
  return producto;
}

module.exports = {
  listarProductos,
  buscarProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto
};