const express = require('express');
const productosRoutes = require('./routes/productos.routes');
const manejarErrores = require('./middlewares/manejar-errores');

const app = express();

app.disable('x-powered-by');
app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/productos', productosRoutes);

app.use((_req, res) => {
  res.status(404).json({
    error: { message: 'Ruta no encontrada.' }
  });
});

app.use(manejarErrores);

module.exports = app;