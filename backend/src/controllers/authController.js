const { getConnection, sql } = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Controlador de Autenticación
 */
const authController = {
    /**
     * @route POST /api/auth/register
     * @desc Registra un nuevo usuario en la base de datos
     */
    register: async (req, res, next) => {
        try {
            const { nombre, email, password, rol } = req.body;
            
            const pool = await getConnection();

            // 1. Verificar si el usuario ya existe
            const userExist = await pool.request()
                .input('email', sql.NVarChar, email)
                .query('SELECT id FROM Usuarios WHERE email = @email');

            if (userExist.recordset.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'El correo electrónico ya está en uso.'
                });
            }

            // 2. Hashear la contraseña
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // 3. Insertar el nuevo usuario
            const result = await pool.request()
                .input('nombre', sql.NVarChar, nombre)
                .input('email', sql.NVarChar, email)
                .input('password', sql.NVarChar, hashedPassword)
                .input('rol', sql.NVarChar, rol)
                .query(`
                    INSERT INTO Usuarios (nombre, email, password, rol) 
                    OUTPUT INSERTED.id, INSERTED.nombre, INSERTED.email, INSERTED.rol 
                    VALUES (@nombre, @email, @password, @rol)
                `);

            const newUser = result.recordset[0];

            // 4. Generar token JWT
            const payload = {
                id: newUser.id,
                rol: newUser.rol
            };

            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: '8h' // El token expira en 8 horas
            });

            // 5. Responder con éxito
            res.status(201).json({
                success: true,
                message: 'Usuario registrado exitosamente.',
                data: {
                    user: newUser,
                    token
                }
            });

        } catch (error) {
            next(error); // Pasamos el error al manejador global de errores
        }
    },

    /**
     * @route POST /api/auth/login
     * @desc Inicia sesión y devuelve un token JWT
     */
    login: async (req, res, next) => {
        try {
            const { email, password } = req.body;

            const pool = await getConnection();

            // 1. Buscar al usuario por email
            const result = await pool.request()
                .input('email', sql.NVarChar, email)
                .query('SELECT id, nombre, email, password, rol, estado FROM Usuarios WHERE email = @email');

            const user = result.recordset[0];

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciales inválidas.' // Mensaje genérico por seguridad
                });
            }

            // 2. Verificar si el usuario está inactivo
            if (!user.estado) {
                return res.status(403).json({
                    success: false,
                    message: 'La cuenta está desactivada. Contacte al administrador.'
                });
            }

            // 3. Comparar contraseñas
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciales inválidas.'
                });
            }

            // 4. Generar el JWT
            const payload = {
                id: user.id,
                rol: user.rol
            };

            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: '8h'
            });

            // Eliminar password del objeto user antes de devolverlo
            delete user.password;

            // 5. Responder
            res.status(200).json({
                success: true,
                message: 'Inicio de sesión exitoso.',
                data: {
                    user,
                    token
                }
            });

        } catch (error) {
            next(error);
        }
    },

    /**
     * @route GET /api/auth/profile
     * @desc Obtiene los datos del perfil del usuario autenticado
     */
    getProfile: async (req, res, next) => {
        try {
            // req.user viene del middleware authenticateToken
            const userId = req.user.id;

            const pool = await getConnection();
            
            const result = await pool.request()
                .input('id', sql.Int, userId)
                .query('SELECT id, nombre, email, rol, estado, fecha_creacion FROM Usuarios WHERE id = @id');

            const user = result.recordset[0];

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado.'
                });
            }

            res.status(200).json({
                success: true,
                data: {
                    user
                }
            });

        } catch (error) {
            next(error);
        }
    }
};

module.exports = authController;
