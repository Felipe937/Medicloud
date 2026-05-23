const { body } = require('express-validator');

const handleValidationErrors = require('./handleValidationErrors');

const validateMedico = [
    body('nombre')
        .trim()
        .notEmpty().withMessage('El nombre del medico es obligatorio')
        .isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres'),

    body('especialidad')
        .trim()
        .notEmpty().withMessage('La especialidad es obligatoria')
        .isLength({ min: 3, max: 100 }).withMessage('La especialidad debe tener entre 3 y 100 caracteres'),

    body('telefono')
        .optional({ nullable: true, checkFalsy: true })
        .trim()
        .isLength({ max: 20 }).withMessage('El telefono no puede superar 20 caracteres'),

    body('email')
        .optional({ nullable: true, checkFalsy: true })
        .trim()
        .isEmail().withMessage('El email debe ser valido')
        .normalizeEmail(),

    handleValidationErrors
];

module.exports = {
    validateMedico
};
