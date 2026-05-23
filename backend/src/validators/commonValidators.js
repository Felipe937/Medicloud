const { param } = require('express-validator');

const handleValidationErrors = require('./handleValidationErrors');

const validateIdParam = (paramName = 'id') => [
    param(paramName)
        .isInt({ min: 1 }).withMessage(`El parametro ${paramName} debe ser un entero positivo`),
    handleValidationErrors
];

module.exports = {
    validateIdParam
};
