const { validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);

    if (errors.isEmpty()) {
        return next();
    }

    return res.status(400).json({
        success: false,
        message: 'La solicitud contiene errores de validacion',
        errors: errors.array().map((error) => ({
            field: error.path || error.param,
            message: error.msg,
            value: error.value
        }))
    });
};

module.exports = handleValidationErrors;
