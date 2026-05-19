const { getConnection, sql } = require('../config/database');

exports.getAll = async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query('SELECT * FROM medicos WHERE estado = 1');
        res.json({ success: true, data: result.recordset });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error' });
    }
};

exports.create = async (req, res) => {
    const { nombre, especialidad, telefono, email } = req.body;
    try {
        const pool = await getConnection();
        await pool.request()
            .input('nombre', sql.VarChar, nombre)
            .input('especialidad', sql.VarChar, especialidad)
            .input('telefono', sql.VarChar, telefono)
            .input('email', sql.VarChar, email)
            .query('INSERT INTO medicos (nombre, especialidad, telefono, email) VALUES (@nombre, @especialidad, @telefono, @email)');
        res.status(201).json({ success: true, message: 'Médico creado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error' });
    }
};

exports.update = async (req, res) => {
    const { id } = req.params;
    const { nombre, especialidad, telefono, email } = req.body;
    try {
        const pool = await getConnection();
        await pool.request()
            .input('nombre', sql.VarChar, nombre)
            .input('especialidad', sql.VarChar, especialidad)
            .input('telefono', sql.VarChar, telefono)
            .input('email', sql.VarChar, email)
            .input('id', sql.Int, id)
            .query('UPDATE medicos SET nombre=@nombre, especialidad=@especialidad, telefono=@telefono, email=@email WHERE id_medico=@id');
        res.json({ success: true, message: 'Actualizado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error' });
    }
};

exports.delete = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await getConnection();
        await pool.request()
            .input('id', sql.Int, id)
            .query('UPDATE medicos SET estado=0 WHERE id_medico=@id');
        res.json({ success: true, message: 'Eliminado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error' });
    }
};
