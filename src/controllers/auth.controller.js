const jwt = require('jsonwebtoken');
const { secreto, algoritmo, segundosVigencia } = require('../config/jwt');
const {
  crearUsuario,
  buscarUsuarioParaLogin,
  esCorreoDuplicado
} = require('../data/usuarios.data');
const {
  normalizarCorreo,
  contrasenaValida,
  validarNuevoUsuario,
  generarHash,
  compararContrasena
} = require('../seguridad/credenciales');

async function registrar(req, res) {
  const { datos, mensaje } = validarNuevoUsuario(req.body ?? {});
  if (mensaje) {
    return res.status(400).json({ error: { message: mensaje } });
  }

  const { nombre, correo, contrasena } = datos;
  try {
    const contrasenaHash = await generarHash(contrasena);
    const usuario = await crearUsuario({ nombre, correo, contrasenaHash }, 'usuario');
    return res.status(201).json({ data: usuario });
  } catch (error) {
    if (esCorreoDuplicado(error)) {
      return res.status(409).json({ error: { message: 'El correo ya está registrado.' } });
    }
    throw error;
  }
}

async function iniciarSesion(req, res) {
  const { correo, contrasena } = req.body ?? {};
  const correoNormalizado = normalizarCorreo(correo);

  if (!correoNormalizado || typeof contrasena !== 'string' || !contrasena) {
    return res.status(400).json({ error: { message: 'Envía un correo y una contraseña válidos.' } });
  }

  const usuario = await buscarUsuarioParaLogin(correoNormalizado);
  const coincide = contrasenaValida(contrasena)
    && await compararContrasena(contrasena, usuario?.contrasena_hash);

  if (!usuario || !coincide) {
    return res.status(401).json({ error: { message: 'Correo o contraseña incorrectos.' } });
  }

  const token = jwt.sign({}, secreto, {
    algorithm: algoritmo,
    subject: String(usuario.id),
    expiresIn: segundosVigencia
  });

  return res.status(200).json({
    data: {
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol
      },
      token
    }
  });
}

module.exports = { registrar, iniciarSesion };