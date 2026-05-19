const { getConnection, sql } = require('../config/database');
const bcrypt = require('bcryptjs');

exports.getAll = async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query(`
            SELECT p.*, u.nombre, u.email 
            FROM pacientes p 
            JOIN usuarios u ON p.id_usuario = u.id_usuario 
            WHERE p.estado = 1
        `);
        res.json({ success: true, data: result.recordset });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error al obtener pacientes' });
    }
};

exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT p.*, u.nombre, u.email 
                FROM pacientes p 
                JOIN usuarios u ON p.id_usuario = u.id_usuario 
                WHERE p.id_paciente = @id AND p.estado = 1
            `);
        const rows = result.recordset;
        if (rows.length === 0) return res.status(404).json({ success: false, message: 'No encontrado' });
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error' });
    }
};

exports.create = async (req, res) => {
    try {
        const { documento, nombre, fecha_nacimiento, telefono, direccion } = req.body;
        const tempPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(tempPassword, 10);
        
        const pool = await getConnection();
        
        // Se utiliza OUTPUT INSERTED.id_usuario para obtener el ID recién insertado en SQL Server
        const userResult = await pool.request()
            .input('nombre', sql.VarChar, nombre)
            .input('email', sql.VarChar, `${documento}@temp.medicloud.com`)
            .input('password_hash', sql.VarChar, hashedPassword)
            .input('rol', sql.VarChar, 'recepcion')
            .query(`
                INSERT INTO usuarios (nombre, email, password_hash, rol) 
                OUTPUT INSERTED.id_usuario
                VALUES (@nombre, @email, @password_hash, @rol)
            `);
            
        const insertId = userResult.recordset[0].id_usuario;

        await pool.request()
            .input('id_usuario', sql.Int, insertId)
            .input('documento', sql.VarChar, documento)
            .input('fecha_nacimiento', sql.Date, fecha_nacimiento)
            .input('telefono', sql.VarChar, telefono)
            .input('direccion', sql.VarChar, direccion)
            .query(`
                INSERT INTO pacientes (id_usuario, documento, fecha_nacimiento, telefono, direccion) 
                VALUES (@id_usuario, @documento, @fecha_nacimiento, @telefono, @direccion)
            `);

        res.status(201).json({ success: true, message: 'Paciente creado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error al crear' });
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { documento, telefono, direccion } = req.body;
        
        const pool = await getConnection();
        await pool.request()
            .input('documento', sql.VarChar, documento)
            .input('telefono', sql.VarChar, telefono)
            .input('direccion', sql.VarChar, direccion)
            .input('id', sql.Int, id)
            .query('UPDATE pacientes SET documento=@documento, telefono=@telefono, direccion=@direccion WHERE id_paciente=@id');
            
        res.json({ success: true, message: 'Actualizado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error' });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        
        const pool = await getConnection();
        await pool.request()
            .input('id', sql.Int, id)
            .query('UPDATE pacientes SET estado=0 WHERE id_paciente=@id');
            
        res.json({ success: true, message: 'Eliminado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error' });
    }
};

exports.search = async (req, res) => {
    const { q } = req.query;
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('q_like', sql.VarChar, `%${q}%`)
            .input('q', sql.VarChar, q)
            .query(`
                SELECT p.*, u.nombre 
                FROM pacientes p 
                JOIN usuarios u ON p.id_usuario = u.id_usuario 
                WHERE p.documento LIKE @q_like 
                   OR u.nombre LIKE @q_like 
                   OR TRY_CAST(p.fecha_creacion AS DATE) = TRY_CAST(@q AS DATE)
            `);
            
        res.json({ success: true, data: result.recordset });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error en búsqueda' });
    }
};
