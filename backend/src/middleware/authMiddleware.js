const jwt = require('jsonwebtoken');

/**
 * Middleware para verificar que el usuario está autenticado mediante JWT.
 * Extrae el token del header 'Authorization', lo verifica y adjunta la información
 * decodificada al objeto `req.user`.
 */
const authenticateToken = (req, res, next) => {
    // El token generalmente viene en el header: "Authorization: Bearer <token>"
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Obtiene la segunda parte (el token)

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Acceso denegado. No se proporcionó un token de autenticación.'
        });
    }

    try {
        // Verifica la firma y la vigencia del token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Adjuntamos la información del usuario a la request para que otros middlewares/controladores puedan usarla
        req.user = decoded;
        
        next(); // El token es válido, continuamos al siguiente middleware/controlador
    } catch (error) {
        // Distinguir entre token expirado o token inválido para mejor feedback
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'El token ha expirado. Por favor, inicie sesión nuevamente.'
            });
        }
        
        return res.status(403).json({
            success: false,
            message: 'Token inválido o corrupto.'
        });
    }
};

module.exports = authenticateToken;
