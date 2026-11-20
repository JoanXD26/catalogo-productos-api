const favoritosData = require('../data/favoritos.data');

async function listar(_req, res) {
  const favoritos = await favoritosData.listarFavoritos(res.locals.usuario.id);
  return res.status(200).json({ data: favoritos });
}

async function agregar(_req, res) {
  const { usuario, productoId } = res.locals;

  try {
    const favorito = await favoritosData.agregarFavorito(usuario.id, productoId);
    if (!favorito) {
      return res.status(409).json({
        error: { message: 'El producto ya está en tus favoritos.' }
      });
    }

    return res.status(201).json({ data: favorito });
  } catch (error) {
    if (error.code === '23503' && error.constraint === 'favoritos_producto_fk') {
      return res.status(404).json({
        error: { message: 'Producto no encontrado.' }
      });
    }

    throw error;
  }
}

async function eliminar(_req, res) {
  const { usuario, productoId } = res.locals;
  const favorito = await favoritosData.eliminarFavorito(usuario.id, productoId);

  if (!favorito) {
    return res.status(404).json({
      error: { message: 'Favorito no encontrado.' }
    });
  }

  return res.status(200).json({ data: favorito });
}

module.exports = { listar, agregar, eliminar }; 