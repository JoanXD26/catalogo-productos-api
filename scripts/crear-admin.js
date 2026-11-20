require('dotenv').config({ quiet: true });

const pool = require('../src/config/database');
const { crearUsuario, esCorreoDuplicado } = require('../src/data/usuarios.data');
const { validarNuevoUsuario, generarHash } = require('../src/seguridad/credenciales');

async function crearAdministrador() {
  try {
    const [nombre, correo] = process.argv.slice(2);
    const contrasena = process.env.ADMIN_CONTRASENA;
    const { datos, mensaje } = validarNuevoUsuario({ nombre, correo, contrasena });

    if (mensaje) {
      console.error(mensaje);
      process.exitCode = 1;
      return;
    }

    const contrasenaHash = await generarHash(datos.contrasena);
    const usuario = await crearUsuario(
      { nombre: datos.nombre, correo: datos.correo, contrasenaHash },
      'administrador'
    );
    console.log(`Administrador creado con id ${usuario.id}.`);
  } catch (error) {
    const mensaje = esCorreoDuplicado(error)
      ? 'El correo ya está registrado.'
      : `No se pudo crear el administrador (${error.code ?? 'sin código'}).`;
    console.error(mensaje);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

crearAdministrador();