const isJsonSyntaxError = (error) => {
    return error instanceof SyntaxError && error.status === 400 && 'body' in error;
};

const getStatusCode = (error, res) => {
    if (res.statusCode && res.statusCode !== 200) {
        return res.statusCode;
    }

    return error.statusCode || error.status || 500;
};

const asyncHandler = (handler) => {
    return (req, res, next) => {
        Promise.resolve(handler(req, res, next)).catch(next);
    };
};

const errorHandler = (error, req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }

    const statusCode = isJsonSyntaxError(error) ? 400 : getStatusCode(error, res);
    const message = isJsonSyntaxError(error)
        ? 'JSON malformado en la solicitud'
        : error.message || 'Error interno del servidor';

    const response = {
        success: false,
        message
    };

    if (process.env.NODE_ENV !== 'production') {
        response.stack = error.stack;
    }

    console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${statusCode}: ${message}`);

    if (process.env.NODE_ENV !== 'production' && error.stack) {
        console.error(error.stack);
    }

    return res.status(statusCode).json(response);
};

module.exports = {
    asyncHandler,
    errorHandler
};
