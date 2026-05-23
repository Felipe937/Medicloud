const { getConnection } = require('../config/database');

const getStats = async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query(`
            SELECT
                (SELECT COUNT(*) FROM pacientes WHERE estado = 1) AS totalPacientes,
                (SELECT COUNT(*) FROM medicos WHERE estado = 1) AS totalMedicos,
                (SELECT COUNT(*) FROM citas) AS totalCitas,
                (
                    SELECT COUNT(*)
                    FROM citas
                    WHERE fecha_hora >= CONVERT(date, GETDATE())
                      AND fecha_hora < DATEADD(day, 1, CONVERT(date, GETDATE()))
                      AND estado <> 'cancelada'
                ) AS citasHoy,
                (
                    SELECT COUNT(*)
                    FROM citas
                    WHERE estado = 'programada'
                ) AS citasPendientes
        `);

        return res.json({
            success: true,
            data: result.recordset[0]
        });
    } catch (error) {
        console.error('Error al obtener estadisticas del dashboard:', error);

        return res.status(500).json({
            success: false,
            message: 'Error al obtener estadisticas del dashboard'
        });
    }
};

module.exports = {
    getStats
};
