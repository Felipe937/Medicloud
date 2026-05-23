const { body } = require('express-validator');

const handleValidationErrors = require('./handleValidationErrors');

const validateRegister = [
    body('nombre')
        .trim()
        .notEmpty().withMessage('El nombre es obligatorio')
        .isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres'),

    body('email')
        .trim()
        .notEmpty().withMessage('El email es obligatorio')
        .isEmail().withMessage('El email debe ser valido')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('La contrasena es obligatoria')
        .isLength({ min: 6 }).withMessage('La contrasena debe tener al menos 6 caracteres')
        .matches(/\d/).withMessage('La contrasena debe contener al menos un numero'),

    body('rol')
        .notEmpty().withMessage('El rol es obligatorio')
        .isIn(['admin', 'medico', 'recepcion']).withMessage('El rol no es valido'),

    handleValidationErrors
];

const validateLogin = [
    body('email')
        .trim()
        .notEmpty().withMessage('El email es obligatorio')
        .isEmail().withMessage('El email debe ser valido')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('La contrasena es obligatoria'),

    handleValidationErrors
];

module.exports = {
    validateRegister,
    validateLogin
};
