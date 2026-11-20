const express = require('express');
const authRoutes = require('./routes/auth.routes');
const productosRoutes = require('./routes/productos.routes');
const manejarErrores = require('./middlewares/manejar-errores');

const app = express();

app.disable('x-powered-by');

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/productos', productosRoutes);

app.use((_req, res) => {
  res.status(404).json({
    error: { message: 'Ruta no encontrada.' }
  });
});

app.use(manejarErrores);

module.exports = app;