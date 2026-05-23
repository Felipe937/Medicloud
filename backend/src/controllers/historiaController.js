const { getConnection, sql } = require('../config/database');
const { encryptData, decryptData } = require('../utils/cryptoUtils');

const HISTORIA_SELECT = `
    SELECT
        id_historia,
        id_paciente,
        diagnostico,
        tratamiento,
        notas_medicas,
        fecha_creacion
    FROM historias_clinicas
`;

const sendError = (res, error, message) => {
    console.error(message, error);
    return res.status(500).json({ success: false, message });
};

const getPacienteId = (body) => body.id_paciente || body.paciente;

const decryptValue = (value) => (value ? decryptData(value) : null);

const mapHistoria = (historia) => ({
    id_historia: historia.id_historia,
    paciente: historia.id_paciente,
    id_paciente: historia.id_paciente,
    diagnostico: decryptValue(historia.diagnostico),
    tratamiento: decryptValue(historia.tratamiento),
    notas_medicas: historia.notas_medicas,
    fecha_creacion: historia.fecha_creacion
});

const crearHistoriaClinica = async (req, res) => {
    const paciente = getPacienteId(req.body);
    const { diagnostico, tratamiento, notas_medicas = null } = req.body;

    if (!paciente || !diagnostico || !tratamiento) {
        return res.status(400).json({
            success: false,
            message: 'Paciente, diagnostico y tratamiento son requeridos'
        });
    }

    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id_paciente', sql.Int, paciente)
            .input('diagnostico', sql.NVarChar(sql.MAX), encryptData(diagnostico))
            .input('tratamiento', sql.NVarChar(sql.MAX), encryptData(tratamiento))
            .input('notas_medicas', sql.NVarChar(sql.MAX), notas_medicas)
            .query(`
                INSERT INTO historias_clinicas (
                    id_paciente,
                    diagnostico,
                    tratamiento,
                    notas_medicas
                )
                OUTPUT INSERTED.id_historia
                VALUES (
                    @id_paciente,
                    @diagnostico,
                    @tratamiento,
                    @notas_medicas
                )
            `);

        return res.status(201).json({
            success: true,
            message: 'Historia clinica creada exitosamente',
            data: { id_historia: result.recordset[0].id_historia }
        });
    } catch (error) {
        return sendError(res, error, 'Error al crear historia clinica');
    }
};

const listarHistorias = async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query(`
            ${HISTORIA_SELECT}
            ORDER BY fecha_creacion DESC
        `);

        return res.json({
            success: true,
            data: result.recordset.map(mapHistoria)
        });
    } catch (error) {
        return sendError(res, error, 'Error al listar historias clinicas');
    }
};

const obtenerHistoriaPorId = async (req, res) => {
    const { id } = req.params;

    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`${HISTORIA_SELECT} WHERE id_historia = @id`);

        if (result.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Historia clinica no encontrada'
            });
        }

        return res.json({
            success: true,
            data: mapHistoria(result.recordset[0])
        });
    } catch (error) {
        return sendError(res, error, 'Error al obtener historia clinica');
    }
};

const actualizarHistoria = async (req, res) => {
    const { id } = req.params;
    const paciente = getPacienteId(req.body);
    const { diagnostico, tratamiento, notas_medicas } = req.body;

    try {
        const fields = [
            { key: 'id_paciente', value: paciente, type: sql.Int },
            {
                key: 'diagnostico',
                value: diagnostico !== undefined ? encryptData(diagnostico) : undefined,
                type: sql.NVarChar(sql.MAX)
            },
            {
                key: 'tratamiento',
                value: tratamiento !== undefined ? encryptData(tratamiento) : undefined,
                type: sql.NVarChar(sql.MAX)
            },
            { key: 'notas_medicas', value: notas_medicas, type: sql.NVarChar(sql.MAX) }
        ].filter((field) => field.value !== undefined);

        if (fields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No se proporcionaron campos para actualizar'
            });
        }

        const pool = await getConnection();
        const request = pool.request().input('id', sql.Int, id);
        const setClauses = fields.map(({ key, value, type }) => {
            request.input(key, type, value);
            return `${key} = @${key}`;
        });

        const result = await request.query(`
            UPDATE historias_clinicas
            SET ${setClauses.join(', ')}
            WHERE id_historia = @id
        `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({
                success: false,
                message: 'Historia clinica no encontrada'
            });
        }

        return res.json({
            success: true,
            message: 'Historia clinica actualizada exitosamente'
        });
    } catch (error) {
        return sendError(res, error, 'Error al actualizar historia clinica');
    }
};

const obtenerHistoriasPorPaciente = async (req, res) => {
    const { id_paciente } = req.params;

    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id_paciente', sql.Int, id_paciente)
            .query(`
                ${HISTORIA_SELECT}
                WHERE id_paciente = @id_paciente
                ORDER BY fecha_creacion DESC
            `);

        return res.json({
            success: true,
            data: result.recordset.map(mapHistoria)
        });
    } catch (error) {
        return sendError(res, error, 'Error al obtener historias del paciente');
    }
};

module.exports = {
    crearHistoriaClinica,
    listarHistorias,
    obtenerHistoriaPorId,
    actualizarHistoria,
    obtenerHistoriasPorPaciente,
    create: crearHistoriaClinica,
    getAll: listarHistorias,
    getById: obtenerHistoriaPorId,
    update: actualizarHistoria,
    getByPaciente: obtenerHistoriasPorPaciente
};
