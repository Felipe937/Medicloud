const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { getConnection } = require('./config/database');
const errorHandler = require('./middleware/errorMiddleware');
const authRoutes = require('./routes/authRoutes');
const citaRoutes = require('./routes/citaRoutes');

const app = express();

// --- Middlewares Globales ---
// Habilitar CORS
app.use(cors());
// Parsear body como JSON
app.use(express.json());
// Parsear urlencoded bodies
app.use(express.urlencoded({ extended: true }));

// --- Test de Conexión a BD (opcional en el arranque) ---
getConnection()
    .then(() => console.log('✅ Conectado a la base de datos SQL Server'))
    .catch(err => console.error('❌ Error conectando a la base de datos:', err.message));

// --- Rutas ---
// Ruta de salud / ping
app.get('/api/ping', (req, res) => {
    res.json({ success: true, message: 'API de Medicloud en funcionamiento' });
});

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// --- Manejo de rutas no encontradas (404) ---
app.use((req, res, next) => {
    const error = new Error(`Ruta no encontrada - ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
});

// --- Middleware Global de Manejo de Errores ---
// Debe ser el último middleware inyectado en Express
app.use(errorHandler);

// --- Iniciar Servidor ---
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});

module.exports = app;
