const mensajesCliente = {
  400: 'La petición tiene un formato inválido.',
  413: 'El cuerpo de la petición supera el tamaño permitido.',
  415: 'La codificación del cuerpo de la petición no es compatible.'
};

function manejarErrores(error, _req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  const mensaje = mensajesCliente[error.status];
  if (mensaje) {
    return res.status(error.status).json({ error: { message: mensaje } });
  }

  console.error('Error al procesar la petición:', error.code ?? error.name);
  return res.status(500).json({
    error: { message: 'Ocurrió un error interno.' }
  });
}

module.exports = manejarErrores;