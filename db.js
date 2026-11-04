// ============================================================================
// DimePrecio.es — Conexión Directa de Base de Datos MySQL
// ============================================================================
require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'srv713.hstgr.io',
  user: process.env.DB_USER || 'u256818095_dimeprecio',
  password: process.env.DB_PASSWORD || 'Dimeprecio.157',
  database: process.env.DB_NAME || 'u256818095_dimeprecio',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  connectTimeout: 8000,
});

module.exports = pool;
