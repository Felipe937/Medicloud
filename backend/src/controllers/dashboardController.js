const { getConnection, sql } = require('../config/database');

exports.getStats = async (req, res) => {
    try {
        const pool = await getConnection();
        
        const citasHoyResult = await pool.request().query("SELECT COUNT(*) as total FROM citas WHERE CAST(fecha_hora AS DATE) = CAST(GETDATE() AS DATE) AND estado != 'cancelada'");
        const pacientesAtendidosResult = await pool.request().query("SELECT COUNT(DISTINCT id_paciente) as total FROM citas WHERE CAST(fecha_hora AS DATE) = CAST(GETDATE() AS DATE) AND estado = 'atendida'");
        const disponibilidadResult = await pool.request().query(`
            SELECT m.id_medico, m.nombre, COUNT(c.id_cita) as citas_programadas 
            FROM medicos m 
            LEFT JOIN citas c ON m.id_medico = c.id_medico AND c.fecha_hora BETWEEN GETDATE() AND DATEADD(hour, 4, GETDATE())
            GROUP BY m.id_medico, m.nombre
        `);
        
        res.json({
            success: true,
            data: {
                citas_hoy: citasHoyResult.recordset[0].total,
                pacientes_atendidos_hoy: pacientesAtendidosResult.recordset[0].total,
                disponibilidad_medicos: disponibilidadResult.recordset
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error' });
    }
};
