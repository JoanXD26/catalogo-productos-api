const { randomBytes } = require('node:crypto');
const bcrypt = require('bcrypt');

const COSTO_BCRYPT = 12;
const FORMATO_CORREO = /^[a-z0-9_%+-]+(?:\.[a-z0-9_%+-]+)*@(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;
const hashSinUsuario = bcrypt.hashSync(randomBytes(32).toString('hex'), COSTO_BCRYPT);

function normalizarCorreo(valor) {
  if (typeof valor !== 'string') {
    return null;
  }

  const correo = valor.trim().toLowerCase();
  return correo.length <= 254 && FORMATO_CORREO.test(correo) ? correo : null;
}

function contrasenaValida(contrasena) {
  return typeof contrasena === 'string'
    && contrasena.isWellFormed()
    && Buffer.byteLength(contrasena, 'utf8') <= 72
    && [...contrasena].length >= 12
    && contrasena.trim() !== '';
}

function validarNuevoUsuario({ nombre, correo, contrasena }) {
  const nombreLimpio = typeof nombre === 'string' ? nombre.trim() : '';
  if (!nombreLimpio || nombreLimpio.includes('\0') || [...nombreLimpio].length > 120) {
    return { mensaje: 'El nombre debe contener entre 1 y 120 caracteres.' };
  }

  const correoNormalizado = normalizarCorreo(correo);
  if (!correoNormalizado) {
    return { mensaje: 'El correo electrónico debe ser válido y tener hasta 254 caracteres.' };
  }

  if (!contrasenaValida(contrasena)) {
    return { mensaje: 'La contraseña debe contener al menos 12 caracteres y un máximo de 72 bytes.' };
  }

  return { datos: { nombre: nombreLimpio, correo: correoNormalizado, contrasena } };
}

function generarHash(contrasena) {
  return bcrypt.hash(contrasena, COSTO_BCRYPT);
}

function compararContrasena(contrasena, hash = hashSinUsuario) {
  return bcrypt.compare(contrasena, hash);
}

module.exports = {
  normalizarCorreo,
  contrasenaValida,
  validarNuevoUsuario,
  generarHash,
  compararContrasena
};