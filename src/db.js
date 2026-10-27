const mysql2 = require('mysql2/promise');

const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'defaultdb',
  timezone: 'Z', // read and write times as UTC; the browser shows them in local time
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

if ((process.env.DB_SSL || '').toUpperCase() === 'REQUIRED') {
  // Aiven uses its own certificate authority, so we skip certificate
  // verification for this class project (the connection is still encrypted).
  poolConfig.ssl = { rejectUnauthorized: false };
}


const pool = mysql2.createPool(poolConfig);
module.exports = pool;