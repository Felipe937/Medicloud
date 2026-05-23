module.exports = {
    testEnvironment: 'node',
    clearMocks: true,
    restoreMocks: true,
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    testMatch: ['<rootDir>/tests/**/*.test.js'],
    collectCoverage: true,
    coverageDirectory: '<rootDir>/coverage',
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/app.js',
        '!**/node_modules/**',
    ],
    coverageReporters: ['text', 'text-summary', 'json', 'html', 'lcov'],
    coverageThreshold: {
        global: {
            statements: 50,
            branches: 20,
            functions: 35,
            lines: 50,
        },
    },
};
