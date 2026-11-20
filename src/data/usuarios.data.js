const pool = require('../config/database');

async function crearUsuario({ nombre, correo, contrasenaHash }, rol) {
  const { rows: [usuario] } = await pool.query(
    `INSERT INTO usuarios (nombre, correo, contrasena_hash, rol)
     VALUES ($1, $2, $3, $4)
     RETURNING id, nombre, correo, rol`,
    [nombre, correo, contrasenaHash, rol]
  );
  return usuario;
}

async function buscarUsuarioParaLogin(correo) {
  const { rows: [usuario] } = await pool.query(
    'SELECT id, nombre, correo, contrasena_hash, rol FROM usuarios WHERE correo = $1',
    [correo]
  );
  return usuario;
}

async function buscarUsuarioPorId(id) {
  const { rows: [usuario] } = await pool.query(
    'SELECT id, rol FROM usuarios WHERE id = $1',
    [id]
  );
  return usuario;
}

function esCorreoDuplicado(error) {
  return error.code === '23505' && error.constraint === 'usuarios_correo_unico';
}

module.exports = { crearUsuario, buscarUsuarioParaLogin, buscarUsuarioPorId, esCorreoDuplicado };