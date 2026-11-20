const ID_MAXIMO = 2147483647;
const FORMATO_PRECIO = /^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/;

function leerTexto(valor, maximo = Infinity) {
  if (typeof valor !== 'string') {
    return null;
  }

  const texto = valor.trim();
  if (!texto || texto.includes('\0') || [...texto].length > maximo) {
    return null;
  }

  return texto;
}

function responderDatosInvalidos(res, message) {
  return res.status(400).json({ error: { message } });
}

function validarId(req, res, next) {
  const { id } = req.params;
  const numero = Number(id);

  if (!/^[1-9]\d*$/.test(id) || numero > ID_MAXIMO) {
    return responderDatosInvalidos(res, 'El id debe ser un entero entre 1 y 2147483647.');
  }

  res.locals.productoId = numero;
  return next();
}

function validarCategoria(req, res, next) {
  const { categoria } = req.query;
  if (categoria === undefined) {
    res.locals.categoria = null;
    return next();
  }

  const texto = leerTexto(categoria, 80);
  if (!texto) {
    return responderDatosInvalidos(res, 'La categoría debe ser un texto de 1 a 80 caracteres.');
  }

  res.locals.categoria = texto;
  return next();
}

function validarProducto(req, res, next) {
  const { nombre, descripcion, categoria, precio } = req.body ?? {};
  const producto = {
    nombre: leerTexto(nombre, 120),
    descripcion: leerTexto(descripcion),
    categoria: leerTexto(categoria, 80),
    precio
  };

  if (!producto.nombre || !producto.descripcion || !producto.categoria) {
    return responderDatosInvalidos(
      res,
      'Nombre, descripción y categoría son obligatorios. El nombre admite hasta 120 caracteres y la categoría hasta 80.'
    );
  }

  if (typeof precio !== 'number' || precio <= 0 || !FORMATO_PRECIO.test(String(precio))) {
    return responderDatosInvalidos(
      res,
      'El precio debe ser un número mayor que cero, con hasta 10 cifras enteras y 2 decimales.'
    );
  }

  res.locals.producto = producto;
  return next();
}

module.exports = { validarId, validarCategoria, validarProducto };