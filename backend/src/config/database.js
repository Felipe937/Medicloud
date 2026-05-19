const sql = require('mssql');
require('dotenv').config();

const config = {
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
    options: {
        encrypt: false, // true para Azure, false para local
        trustServerCertificate: true,
        trustedConnection: process.env.DB_TRUSTED_CONNECTION === 'true'
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

let pool = null;

async function getConnection() {
    if (!pool) {
        pool = await sql.connect(config);
    }
    return pool;
}

module.exports = { getConnection, sql };
