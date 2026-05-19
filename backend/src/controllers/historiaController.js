const { getConnection, sql } = require('../config/database');
const { encrypt, decrypt } = require('../utils/cryptoUtils');

exports.getByPaciente = async (req, res) => {
    const { id_paciente } = req.params;
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id_paciente', sql.Int, id_paciente)
            .query('SELECT * FROM historias_clinicas WHERE id_paciente = @id_paciente');
            
        const decrypted = result.recordset.map(h => ({
            ...h,
            contenido: decrypt(h.contenido_cifrado)
        }));
        
        res.json({ success: true, data: decrypted });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error' });
    }
};

exports.create = async (req, res) => {
    const { id_paciente, contenido } = req.body;
    const encryptedContent = encrypt(contenido);
    try {
        const pool = await getConnection();
        await pool.request()
            .input('id_paciente', sql.Int, id_paciente)
            .input('contenido_cifrado', sql.VarChar(sql.MAX), encryptedContent)
            .query('INSERT INTO historias_clinicas (id_paciente, contenido_cifrado) VALUES (@id_paciente, @contenido_cifrado)');
            
        res.status(201).json({ success: true, message: 'Historia clínica creada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error' });
    }
};
