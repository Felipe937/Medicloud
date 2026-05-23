const { body } = require('express-validator');

const handleValidationErrors = require('./handleValidationErrors');

const validatePacienteField = (required = true) => {
    const validator = body('paciente')
        .custom((value, { req }) => {
            const paciente = value || req.body.id_paciente;

            if (!paciente && required) {
                throw new Error('El paciente es obligatorio');
            }

            if (paciente && (!Number.isInteger(Number(paciente)) || Number(paciente) < 1)) {
                throw new Error('El paciente debe ser un ID valido');
            }

            return true;
        });

    return validator;
};

const validateCreateHistoria = [
    validatePacienteField(true),

    body('diagnostico')
        .trim()
        .notEmpty().withMessage('El diagnostico es obligatorio')
        .isLength({ max: 2000 }).withMessage('El diagnostico no puede superar 2000 caracteres'),

    body('tratamiento')
        .trim()
        .notEmpty().withMessage('El tratamiento es obligatorio')
        .isLength({ max: 2000 }).withMessage('El tratamiento no puede superar 2000 caracteres'),

    body('notas_medicas')
        .optional({ nullable: true, checkFalsy: true })
        .trim()
        .isLength({ max: 3000 }).withMessage('Las notas medicas no pueden superar 3000 caracteres'),

    handleValidationErrors
];

const validateUpdateHistoria = [
    validatePacienteField(false),

    body('diagnostico')
        .optional()
        .trim()
        .notEmpty().withMessage('El diagnostico no puede estar vacio')
        .isLength({ max: 2000 }).withMessage('El diagnostico no puede superar 2000 caracteres'),

    body('tratamiento')
        .optional()
        .trim()
        .notEmpty().withMessage('El tratamiento no puede estar vacio')
        .isLength({ max: 2000 }).withMessage('El tratamiento no puede superar 2000 caracteres'),

    body('notas_medicas')
        .optional({ nullable: true, checkFalsy: true })
        .trim()
        .isLength({ max: 3000 }).withMessage('Las notas medicas no pueden superar 3000 caracteres'),

    handleValidationErrors
];

module.exports = {
    validateCreateHistoria,
    validateUpdateHistoria
};
