const request = require('supertest');

const app = require('../src/app');

const { createToken } = require('./helpers/auth');
const {
    mockQueryResult,
    queueQueryResults,
    resetDatabaseMock
} = require('./helpers/mockDatabase');

const adminToken = () => `Bearer ${createToken({ rol: 'admin' })}`;

describe('Medicos API', () => {
    beforeEach(() => {
        resetDatabaseMock();
    });

    it('retorna 401 cuando no hay token', async () => {
        const response = await request(app).get('/api/medicos');

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
    });

    it('lista medicos autenticados', async () => {
        queueQueryResults(mockQueryResult([{
            id_medico: 1,
            nombre: 'Dr. Juan Lopez',
            especialidad: 'Cardiologia',
            telefono: '3001234567',
            email: 'juan@medicloud.com'
        }]));

        const response = await request(app)
            .get('/api/medicos')
            .set('Authorization', adminToken());

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data[0].especialidad).toBe('Cardiologia');
    });

    it('valida datos requeridos al crear medico', async () => {
        const response = await request(app)
            .post('/api/medicos')
            .set('Authorization', adminToken())
            .send({ nombre: '', especialidad: '', email: 'no-email' });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.errors).toEqual(expect.any(Array));
    });

    it('crea medico con datos validos', async () => {
        queueQueryResults(mockQueryResult([], [1]));

        const response = await request(app)
            .post('/api/medicos')
            .set('Authorization', adminToken())
            .send({
                nombre: 'Dr. Juan Lopez',
                especialidad: 'Cardiologia',
                telefono: '3001234567',
                email: 'juan@medicloud.com'
            });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
    });

    it('elimina medico con id valido', async () => {
        queueQueryResults(mockQueryResult([], [1]));

        const response = await request(app)
            .delete('/api/medicos/1')
            .set('Authorization', adminToken());

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
    });
});
