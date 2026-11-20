const productosData = require('../data/productos.data');

function responderProducto(res, producto) {
  if (!producto) {
    return res.status(404).json({
      error: { message: 'Producto no encontrado.' }
    });
  }

  return res.status(200).json({ data: producto });
}

async function listar(_req, res) {
  const productos = await productosData.listarProductos(res.locals.categoria);
  return res.status(200).json({ data: productos });
}

async function consultar(_req, res) {
  const producto = await productosData.buscarProductoPorId(res.locals.productoId);
  return responderProducto(res, producto);
}

async function crear(_req, res) {
  const producto = await productosData.crearProducto(res.locals.producto);
  return res.status(201).json({ data: producto });
}

async function actualizar(_req, res) {
  const { productoId, producto } = res.locals;
  const actualizado = await productosData.actualizarProducto(productoId, producto);
  return responderProducto(res, actualizado);
}

async function eliminar(_req, res) {
  const producto = await productosData.eliminarProducto(res.locals.productoId);
  return responderProducto(res, producto);
}

module.exports = { listar, consultar, crear, actualizar, eliminar };