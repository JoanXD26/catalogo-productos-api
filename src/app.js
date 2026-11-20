const express = require('express');

const app = express();

app.disable('x-powered-by');

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use((_req, res) => {
  res.status(404).json({
    error: { message: 'Ruta no encontrada.' }
  });
});

module.exports = app;