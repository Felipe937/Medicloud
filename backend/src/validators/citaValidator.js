const { body } = require('express-validator');

const handleValidationErrors = require('./handleValidationErrors');

const validateFechaFutura = (value) => {
    const fechaCita = new Date(value);

    if (Number.isNaN(fechaCita.getTime())) {
        throw new Error('La fecha de la cita no es valida');
    }

    if (fechaCita <= new Date()) {
        throw new Error('La fecha de la cita debe ser futura');
    }

    return true;
};

const validateCreateCita = [
    body('id_medico')
        .notEmpty().withMessage('El medico es obligatorio')
        .bail()
        .isInt({ min: 1 }).withMessage('El medico debe ser un ID valido'),

    body('id_paciente')
        .notEmpty().withMessage('El paciente es obligatorio')
        .bail()
        .isInt({ min: 1 }).withMessage('El paciente debe ser un ID valido'),

    body('fecha_hora')
        .notEmpty().withMessage('La fecha de la cita es obligatoria')
        .bail()
        .isISO8601().withMessage('La fecha debe tener un formato valido')
        .bail()
        .custom(validateFechaFutura),

    body('motivo')
        .trim()
        .notEmpty().withMessage('El motivo es requerido'),

    handleValidationErrors
];

const validateUpdateCita = [
    body('id_medico')
        .optional()
        .isInt({ min: 1 }).withMessage('El medico debe ser un ID valido'),

    body('id_paciente')
        .optional()
        .isInt({ min: 1 }).withMessage('El paciente debe ser un ID valido'),

    body('fecha_hora')
        .optional()
        .isISO8601().withMessage('La fecha debe tener un formato valido')
        .bail()
        .custom(validateFechaFutura),

    body('motivo')
        .optional()
        .trim()
        .notEmpty().withMessage('El motivo es requerido'),

    handleValidationErrors
];

module.exports = {
    validateCreateCita,
    validateUpdateCita
};
