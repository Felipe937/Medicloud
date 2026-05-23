const request = require('supertest');

const app = require('../src/app');

const { createToken } = require('./helpers/auth');
const {
    mockQueryResult,
    queueQueryResults,
    resetDatabaseMock
} = require('./helpers/mockDatabase');

const token = () => `Bearer ${createToken({ rol: 'admin' })}`;

describe('Pacientes API', () => {
    beforeEach(() => {
        resetDatabaseMock();
    });

    it('retorna 401 si no se envia JWT', async () => {
        const response = await request(app).get('/api/pacientes');

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
    });

    it('lista pacientes con respuesta JSON', async () => {
        queueQueryResults(mockQueryResult([{
            id_paciente: 1,
            documento: '123456789',
            nombre: 'Ana Perez',
            email: 'ana@medicloud.com',
            telefono: '3001234567'
        }]));

        const response = await request(app)
            .get('/api/pacientes')
            .set('Authorization', token());

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].documento).toBe('123456789');
    });

    it('retorna 400 cuando crear paciente recibe datos invalidos', async () => {
        const response = await request(app)
            .post('/api/pacientes')
            .set('Authorization', token())
            .send({ documento: '1', nombre: '', fecha_nacimiento: 'fecha' });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.errors).toEqual(expect.any(Array));
    });

    it('crea paciente con datos validos', async () => {
        queueQueryResults(
            mockQueryResult([{ id_usuario: 10 }]),
            mockQueryResult([], [1])
        );

        const response = await request(app)
            .post('/api/pacientes')
            .set('Authorization', token())
            .send({
                documento: '123456789',
                nombre: 'Ana Perez',
                fecha_nacimiento: '1990-03-10',
                telefono: '3001234567',
                direccion: 'Calle 123'
            });

        expect(response.status).toBe(201);
        expect(response.body).toMatchObject({
            success: true,
            message: expect.any(String)
        });
    });

    it('retorna 400 para id invalido', async () => {
        const response = await request(app)
            .get('/api/pacientes/abc')
            .set('Authorization', token());

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });
});
