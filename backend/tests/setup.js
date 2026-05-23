process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'medicloud-test-secret';
process.env.AES_SECRET = process.env.AES_SECRET || 'medicloud-test-aes-secret';

jest.mock('../src/config/database', () => {
    const sql = jest.requireActual('mssql');
    const { mockPool, MockPreparedStatement } = require('./helpers/mockDatabase');

    return {
        sql: {
            ...sql,
            PreparedStatement: MockPreparedStatement
        },
        getConnection: jest.fn(() => Promise.resolve(mockPool))
    };
});
