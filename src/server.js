require('dotenv').config({ quiet: true });

const app = require('./app');

const host = '127.0.0.1';
const port = Number(process.env.PORT ?? '3000');

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error('PORT debe ser un entero entre 1 y 65535.');
  process.exit(1);
}

app.listen(port, host, (error) => {
  if (error) {
    console.error(`No se pudo iniciar el servidor en ${host}:${port} (${error.code}).`);
    process.exitCode = 1;
    return;
  }

  console.log(`API escuchando en http://${host}:${port}`);
});