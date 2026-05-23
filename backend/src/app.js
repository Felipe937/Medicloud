const cors = require('cors');
const express = require('express');
require('dotenv').config();

const { getConnection } = require('./config/database');
const { errorHandler } = require('./middleware/errorHandler');
const requestLogger = require('./middleware/logger');
const authRoutes = require('./routes/authRoutes');
const citaRoutes = require('./routes/citaRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const historiaRoutes = require('./routes/historiaRoutes');
const medicoRoutes = require('./routes/medicoRoutes');
const pacienteRoutes = require('./routes/pacienteRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

if (process.env.NODE_ENV !== 'test') {
    getConnection()
        .then(() => console.log('Conectado a la base de datos SQL Server'))
        .catch((err) => console.error('Error conectando a la base de datos:', err.message));
}

app.get('/api/ping', (req, res) => {
    res.json({ success: true, message: 'API de Medicloud en funcionamiento' });
});

app.use('/api/auth', authRoutes);
app.use('/api/citas', citaRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/historias', historiaRoutes);
app.use('/api/medicos', medicoRoutes);
app.use('/api/pacientes', pacienteRoutes);

app.use((req, res, next) => {
    const error = new Error(`Ruta no encontrada - ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
});

app.use(errorHandler);

if (require.main === module) {
    const PORT = process.env.PORT || 3001;

    app.listen(PORT, () => {
        console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
    });
}

module.exports = app;
