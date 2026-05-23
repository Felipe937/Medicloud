const queryQueue = [];

const createRequest = () => ({
    input: jest.fn().mockReturnThis(),
    query: jest.fn((sqlText) => {
        if (queryQueue.length === 0) {
            throw new Error(`No hay respuesta mockeada para la consulta: ${sqlText}`);
        }

        const nextResult = queryQueue.shift();
        return Promise.resolve(
            typeof nextResult === 'function' ? nextResult(sqlText) : nextResult
        );
    })
});

const mockPool = {
    request: jest.fn(createRequest)
};

class MockPreparedStatement {
    constructor() {
        this.input = jest.fn().mockReturnThis();
        this.prepare = jest.fn(() => Promise.resolve());
        this.unprepare = jest.fn(() => Promise.resolve());
        this.execute = jest.fn(() => {
            if (queryQueue.length === 0) {
                throw new Error('No hay respuesta mockeada para el prepared statement');
            }

            const nextResult = queryQueue.shift();
            return Promise.resolve(
                typeof nextResult === 'function' ? nextResult() : nextResult
            );
        });
    }
}

const mockQueryResult = (recordset = [], rowsAffected = [recordset.length]) => ({
    recordset,
    rowsAffected
});

const queueQueryResults = (...results) => {
    queryQueue.push(...results);
};

const resetDatabaseMock = () => {
    queryQueue.length = 0;
    mockPool.request.mockClear();
};

module.exports = {
    mockPool,
    MockPreparedStatement,
    mockQueryResult,
    queueQueryResults,
    resetDatabaseMock
};
