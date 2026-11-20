const jwt = require('jsonwebtoken');
const { secreto, algoritmo } = require('../config/jwt');
const { buscarUsuarioPorId } = require('../data/usuarios.data');

function responder401(res) {
  return res
    .set('WWW-Authenticate', 'Bearer')
    .status(401)
    .json({ error: { message: 'Token ausente, inválido o vencido.' } });
}

async function autenticar(req, res, next) {
  const encabezado = req.get('Authorization') ?? '';
  const coincidencia = /^Bearer +(\S+)$/i.exec(encabezado);

  if (!coincidencia) {
    return responder401(res);
  }

  let payload;
  try {
    payload = jwt.verify(coincidencia[1], secreto, { algorithms: [algoritmo] });
  } catch {
    return responder401(res);
  }

  const id = Number(payload?.sub);
  if (!Number.isInteger(id) || id < 1 || id > 2147483647
      || String(id) !== payload.sub || !Number.isInteger(payload.exp)) {
    return responder401(res);
  }

  const usuario = await buscarUsuarioPorId(id);
  if (!usuario) {
    return responder401(res);
  }

  res.locals.usuario = usuario;
  return next();
}

function autorizarRoles(...roles) {
  return (_req, res, next) => {
    const { usuario } = res.locals;
    if (!usuario) {
      return responder401(res);
    }

    if (!roles.includes(usuario.rol)) {
      return res.status(403).json({ error: { message: 'Tu rol no permite esta operación.' } });
    }

    return next();
  };
}

module.exports = { autenticar, autorizarRoles };