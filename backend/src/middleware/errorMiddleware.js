/**
 * Middleware para el manejo global de errores en la aplicación.
 * Captura los errores pasados a través de next(err) y devuelve una respuesta estructurada.
 */
const errorHandler = (err, req, res, next) => {
    // Si hay un error de sintaxis en el JSON del body (ej. JSON malformado)
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            success: false,
            message: 'JSON malformado en la petición',
            error: err.message
        });
    }

    // Errores definidos manualmente (pueden venir con un statusCode)
    const statusCode = err.statusCode || 500;
    
    // En producción, no enviamos el stack trace por seguridad
    const response = {
        success: false,
        message: err.message || 'Error interno del servidor',
    };

    if (process.env.NODE_ENV !== 'production') {
        response.stack = err.stack;
    }

    // Log del error en consola para depuración
    console.error(`[Error] ${statusCode} - ${err.message}`);
    if (process.env.NODE_ENV !== 'production') {
        console.error(err.stack);
    }

    res.status(statusCode).json(response);
};

module.exports = errorHandler;
