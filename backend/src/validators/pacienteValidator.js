const { body, query } = require('express-validator');

const handleValidationErrors = require('./handleValidationErrors');

const validatePaciente = [
    body('documento')
        .trim()
        .notEmpty().withMessage('El documento del paciente es obligatorio')
        .isLength({ min: 5, max: 20 }).withMessage('El documento debe tener entre 5 y 20 caracteres'),

    body('nombre')
        .trim()
        .notEmpty().withMessage('El nombre del paciente es obligatorio')
        .isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres'),

    body('fecha_nacimiento')
        .notEmpty().withMessage('La fecha de nacimiento es obligatoria')
        .isISO8601().withMessage('La fecha de nacimiento debe tener un formato valido')
        .custom((value) => {
            if (new Date(value) >= new Date()) {
                throw new Error('La fecha de nacimiento debe ser anterior a hoy');
            }
            return true;
        }),

    body('telefono')
        .optional({ nullable: true, checkFalsy: true })
        .trim()
        .isLength({ max: 20 }).withMessage('El telefono no puede superar 20 caracteres'),

    body('direccion')
        .optional({ nullable: true, checkFalsy: true })
        .trim()
        .isLength({ max: 200 }).withMessage('La direccion no puede superar 200 caracteres'),

    handleValidationErrors
];

const validateUpdatePaciente = [
    body('documento')
        .trim()
        .notEmpty().withMessage('El documento del paciente es obligatorio')
        .isLength({ min: 5, max: 20 }).withMessage('El documento debe tener entre 5 y 20 caracteres'),

    body('telefono')
        .optional({ nullable: true, checkFalsy: true })
        .trim()
        .isLength({ max: 20 }).withMessage('El telefono no puede superar 20 caracteres'),

    body('direccion')
        .optional({ nullable: true, checkFalsy: true })
        .trim()
        .isLength({ max: 200 }).withMessage('La direccion no puede superar 200 caracteres'),

    handleValidationErrors
];

const validateSearchPaciente = [
    query('q')
        .trim()
        .notEmpty().withMessage('El parametro de busqueda q es obligatorio')
        .isLength({ max: 100 }).withMessage('La busqueda no puede superar 100 caracteres'),

    handleValidationErrors
];

module.exports = {
    validatePaciente,
    validateUpdatePaciente,
    validateSearchPaciente
};
