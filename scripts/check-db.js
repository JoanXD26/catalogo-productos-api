require('dotenv').config({ quiet: true });

const pool = require('../src/config/database');

async function checkDatabase() {
  try {
    const { rows: [connection] } = await pool.query(
      'SELECT current_database() AS base_de_datos, current_user AS usuario'
    );

    const { rows: products } = await pool.query(
      `SELECT id, nombre, categoria, precio
       FROM productos
       ORDER BY id
       LIMIT $1`,
      [5]
    );

    console.log(`Conexión correcta a ${connection.base_de_datos} como ${connection.usuario}.`);
    console.table(products);
  } catch (error) {
    console.error(`No se pudo verificar PostgreSQL (${error.code ?? 'sin código'}).`);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

checkDatabase();