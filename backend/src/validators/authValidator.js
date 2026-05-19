const { body, validationResult } = require('express-validator');

// Middleware interno para verificar los resultados de las validaciones
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Errores de validación en los datos enviados.',
            errors: errors.array()
        });
    }
    next();
};

/**
 * Validaciones para el registro de usuario
 */
const validateRegister = [
    body('nombre')
        .trim()
        .notEmpty().withMessage('El nombre es requerido.')
        .isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres.'),
    
    body('email')
        .trim()
        .notEmpty().withMessage('El email es requerido.')
        .isEmail().withMessage('Debe ser un correo electrónico válido.')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('La contraseña es requerida.')
        .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.')
        .matches(/\d/).withMessage('La contraseña debe contener al menos un número.'),

    body('rol')
        .notEmpty().withMessage('El rol es requerido.')
        .isIn(['admin', 'medico', 'recepcion']).withMessage('Rol no válido.'),

    handleValidationErrors
];

/**
 * Validaciones para el inicio de sesión
 */
const validateLogin = [
    body('email')
        .trim()
        .notEmpty().withMessage('El email es requerido.')
        .isEmail().withMessage('Debe ser un correo electrónico válido.')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('La contraseña es requerida.'),

    handleValidationErrors
];

module.exports = {
    validateRegister,
    validateLogin
};
