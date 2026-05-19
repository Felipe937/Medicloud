const { getConnection, sql } = require('../config/database');

const ESTADO_DEFAULT = 'programada';
const ESTADO_CANCELADA = 'cancelada';

const citaSelectQuery = `
    SELECT
        c.*,
        p.documento AS paciente_documento,
        u.nombre AS paciente_nombre,
        u.email AS paciente_email,
        m.nombre AS medico_nombre,
        m.especialidad
    FROM citas c
    JOIN pacientes p ON c.id_paciente = p.id_paciente
    JOIN usuarios u ON p.id_usuario = u.id_usuario
    JOIN medicos m ON c.id_medico = m.id_medico
`;

const sendServerError = (res, error, message) => {
    console.error(message, error);
    return res.status(500).json({ success: false, message });
};

const executePrepared = async (pool, inputs, query, values = {}) => {
    const statement = new sql.PreparedStatement(pool);
    let isPrepared = false;

    inputs.forEach(({ name, type }) => {
        statement.input(name, type);
    });

    try {
        await statement.prepare(query);
        isPrepared = true;
        return await statement.execute(values);
    } finally {
        if (isPrepared) {
            await statement.unprepare();
        }
    }
};

const getCitaBaseById = async (pool, id) => {
    const result = await executePrepared(
        pool,
        [{ name: 'id', type: sql.Int }],
        'SELECT id_cita, id_paciente, id_medico, fecha_hora, estado FROM citas WHERE id_cita = @id',
        { id }
    );

    return result.recordset[0] || null;
};

const hasHorarioConflict = async (pool, { idMedico, fechaHora, excludeId = null }) => {
    const inputs = [
        { name: 'id_medico', type: sql.Int },
        { name: 'fecha_hora', type: sql.DateTime },
        { name: 'estado_cancelada', type: sql.NVarChar(50) }
    ];
    const values = {
        id_medico: idMedico,
        fecha_hora: fechaHora,
        estado_cancelada: ESTADO_CANCELADA
    };
    let excludeFilter = '';

    if (excludeId !== null) {
        inputs.push({ name: 'id_cita', type: sql.Int });
        values.id_cita = excludeId;
        excludeFilter = 'AND id_cita <> @id_cita';
    }

    const result = await executePrepared(
        pool,
        inputs,
        `
            SELECT id_cita
            FROM citas
            WHERE id_medico = @id_medico
              AND fecha_hora = @fecha_hora
              AND estado <> @estado_cancelada
              ${excludeFilter}
        `,
        values
    );

    return result.recordset.length > 0;
};

const createCita = async (req, res) => {
    const {
        id_paciente,
        id_medico,
        fecha_hora,
        motivo,
        observaciones = null,
        estado = ESTADO_DEFAULT
    } = req.body;

    try {
        const pool = await getConnection();
        const existsConflict = await hasHorarioConflict(pool, {
            idMedico: id_medico,
            fechaHora: fecha_hora
        });

        if (existsConflict) {
            return res.status(409).json({
                success: false,
                message: 'El medico ya tiene una cita en ese horario'
            });
        }

        const result = await executePrepared(
            pool,
            [
                { name: 'id_paciente', type: sql.Int },
                { name: 'id_medico', type: sql.Int },
                { name: 'fecha_hora', type: sql.DateTime },
                { name: 'motivo', type: sql.NVarChar(255) },
                { name: 'observaciones', type: sql.NVarChar(sql.MAX) },
                { name: 'estado', type: sql.NVarChar(50) }
            ],
            `
                INSERT INTO citas (id_paciente, id_medico, fecha_hora, motivo, observaciones, estado)
                OUTPUT INSERTED.id_cita
                VALUES (@id_paciente, @id_medico, @fecha_hora, @motivo, @observaciones, @estado)
            `,
            { id_paciente, id_medico, fecha_hora, motivo, observaciones, estado }
        );

        return res.status(201).json({
            success: true,
            message: 'Cita creada exitosamente',
            data: { id_cita: result.recordset[0].id_cita }
        });
    } catch (error) {
        return sendServerError(res, error, 'Error al crear cita');
    }
};

const getAllCitas = async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await executePrepared(
            pool,
            [],
            `${citaSelectQuery} ORDER BY c.fecha_hora DESC`
        );

        return res.json({ success: true, data: result.recordset });
    } catch (error) {
        return sendServerError(res, error, 'Error al obtener citas');
    }
};

const getCitaById = async (req, res) => {
    const { id } = req.params;

    try {
        const pool = await getConnection();
        const result = await executePrepared(
            pool,
            [{ name: 'id', type: sql.Int }],
            `${citaSelectQuery} WHERE c.id_cita = @id`,
            { id }
        );

        if (result.recordset.length === 0) {
            return res.status(404).json({ success: false, message: 'Cita no encontrada' });
        }

        return res.json({ success: true, data: result.recordset[0] });
    } catch (error) {
        return sendServerError(res, error, 'Error al obtener cita');
    }
};

const updateCita = async (req, res) => {
    const { id } = req.params;
    const { id_paciente, id_medico, fecha_hora, motivo, observaciones, estado } = req.body;

    const fields = [
        { key: 'id_paciente', value: id_paciente, type: sql.Int },
        { key: 'id_medico', value: id_medico, type: sql.Int },
        { key: 'fecha_hora', value: fecha_hora, type: sql.DateTime },
        { key: 'motivo', value: motivo, type: sql.NVarChar(255) },
        { key: 'observaciones', value: observaciones, type: sql.NVarChar(sql.MAX) },
        { key: 'estado', value: estado, type: sql.NVarChar(50) }
    ].filter((field) => field.value !== undefined);

    if (fields.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'No se proporcionaron campos para actualizar'
        });
    }

    try {
        const pool = await getConnection();
        const cita = await getCitaBaseById(pool, id);

        if (!cita) {
            return res.status(404).json({ success: false, message: 'Cita no encontrada' });
        }

        const nextIdMedico = id_medico ?? cita.id_medico;
        const nextFechaHora = fecha_hora ?? cita.fecha_hora;

        if ((id_medico !== undefined || fecha_hora !== undefined) && estado !== ESTADO_CANCELADA) {
            const existsConflict = await hasHorarioConflict(pool, {
                idMedico: nextIdMedico,
                fechaHora: nextFechaHora,
                excludeId: Number(id)
            });

            if (existsConflict) {
                return res.status(409).json({
                    success: false,
                    message: 'El medico ya tiene una cita en ese horario'
                });
            }
        }

        const inputs = [{ name: 'id', type: sql.Int }];
        const values = { id };
        const setClauses = fields.map(({ key, value, type }) => {
            inputs.push({ name: key, type });
            values[key] = value;
            return `${key} = @${key}`;
        });

        const result = await executePrepared(
            pool,
            inputs,
            `UPDATE citas SET ${setClauses.join(', ')} WHERE id_cita = @id`,
            values
        );

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ success: false, message: 'Cita no encontrada' });
        }

        return res.json({ success: true, message: 'Cita actualizada exitosamente' });
    } catch (error) {
        return sendServerError(res, error, 'Error al actualizar cita');
    }
};

const deleteCita = async (req, res) => {
    const { id } = req.params;

    try {
        const pool = await getConnection();
        const result = await executePrepared(
            pool,
            [{ name: 'id', type: sql.Int }],
            'DELETE FROM citas WHERE id_cita = @id',
            { id }
        );

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ success: false, message: 'Cita no encontrada' });
        }

        return res.json({ success: true, message: 'Cita eliminada exitosamente' });
    } catch (error) {
        return sendServerError(res, error, 'Error al eliminar cita');
    }
};

const cancelCita = async (req, res) => {
    req.body = { estado: ESTADO_CANCELADA };
    return updateCita(req, res);
};

const getCitasByMedico = async (req, res) => {
    const { id_medico } = req.params;

    try {
        const pool = await getConnection();
        const result = await executePrepared(
            pool,
            [{ name: 'id_medico', type: sql.Int }],
            `
                ${citaSelectQuery}
                WHERE c.id_medico = @id_medico
                  AND c.fecha_hora > GETDATE()
                ORDER BY c.fecha_hora ASC
            `,
            { id_medico }
        );

        return res.json({ success: true, data: result.recordset });
    } catch (error) {
        return sendServerError(res, error, 'Error al obtener citas del medico');
    }
};

module.exports = {
    createCita,
    getAllCitas,
    getCitaById,
    updateCita,
    deleteCita,
    create: createCita,
    getAll: getAllCitas,
    getById: getCitaById,
    update: updateCita,
    delete: deleteCita,
    cancel: cancelCita,
    getByMedico: getCitasByMedico
};
