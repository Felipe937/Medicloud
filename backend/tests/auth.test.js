const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const request = require('supertest');

const app = require('../src/app');

const { createToken } = require('./helpers/auth');
const {
    mockQueryResult,
    queueQueryResults,
    resetDatabaseMock
} = require('./helpers/mockDatabase');

describe('Auth API', () => {
    beforeEach(() => {
        resetDatabaseMock();
    });

    it('retorna 400 cuando el login no tiene email valido', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({ email: 'correo-invalido', password: '' });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.errors).toEqual(expect.any(Array));
    });

    it('retorna 401 con credenciales invalidas', async () => {
        queueQueryResults(mockQueryResult([]));

        const response = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin@medicloud.com', password: 'secret123' });

        expect(response.status).toBe(401);
        expect(response.body).toMatchObject({
            success: false,
            message: expect.any(String)
        });
    });

    it('retorna token JWT y usuario cuando el login es correcto', async () => {
        const password = 'secret123';
        const passwordHash = await bcrypt.hash(password, 10);

        queueQueryResults(mockQueryResult([{
            id: 1,
            nombre: 'Admin Medicloud',
            email: 'admin@medicloud.com',
            password: passwordHash,
            rol: 'admin',
            estado: true
        }]));

        const response = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin@medicloud.com', password });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.user.password).toBeUndefined();
        expect(response.body.data.token).toEqual(expect.any(String));

        const decoded = jwt.verify(response.body.data.token, process.env.JWT_SECRET);
        expect(decoded).toMatchObject({ id: 1, rol: 'admin' });
    });

    it('valida autenticacion JWT en una ruta protegida', async () => {
        queueQueryResults(mockQueryResult([{
            id: 1,
            nombre: 'Admin Medicloud',
            email: 'admin@medicloud.com',
            rol: 'admin',
            estado: true,
            fecha_creacion: new Date()
        }]));

        const response = await request(app)
            .get('/api/auth/profile')
            .set('Authorization', `Bearer ${createToken({ id: 1, rol: 'admin' })}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.user.email).toBe('admin@medicloud.com');
    });
});
