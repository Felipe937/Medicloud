const jwt = require('jsonwebtoken');

const createToken = (payload = {}) => {
    return jwt.sign(
        {
            id: 1,
            rol: 'admin',
            ...payload
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
};

module.exports = {
    createToken
};
