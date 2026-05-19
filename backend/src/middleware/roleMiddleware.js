/**
 * Middleware para autorización basada en roles (RBAC).
 * Verifica si el usuario autenticado (en req.user) tiene uno de los roles permitidos.
 * @param {string[]} allowedRoles - Arreglo de roles permitidos (ej. ['admin', 'medico'])
 */
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        // req.user fue inyectado por authenticateToken middleware
        if (!req.user || !req.user.rol) {
            return res.status(403).json({
                success: false,
                message: 'No se pudo identificar el rol del usuario.'
            });
        }

        // Verifica si el rol del usuario está dentro de los permitidos para esta ruta
        if (!allowedRoles.includes(req.user.rol)) {
            return res.status(403).json({
                success: false,
                message: `Acceso denegado. Rol '${req.user.rol}' no autorizado para esta acción.`
            });
        }

        // Si pasa la validación, continuamos
        next();
    };
};

module.exports = authorizeRoles;
