const request = require('supertest');

const app = require('../src/app');

const { createToken } = require('./helpers/auth');
const {
    mockQueryResult,
    queueQueryResults,
    resetDatabaseMock
} = require('./helpers/mockDatabase');

const authHeader = () => `Bearer ${createToken({ rol: 'admin' })}`;

describe('Citas API', () => {
    beforeEach(() => {
        resetDatabaseMock();
    });

    it('retorna 401 cuando no se envia JWT', async () => {
        const response = await request(app).get('/api/citas');

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
    });

    it('lista citas autenticadas', async () => {
        queueQueryResults(mockQueryResult([{
            id_cita: 1,
            id_paciente: 1,
            id_medico: 1,
            fecha_hora: '2026-06-01T10:00:00.000Z',
            motivo: 'Control general',
            estado: 'programada',
            paciente_nombre: 'Ana Perez',
            medico_nombre: 'Dr. Juan Lopez'
        }]));

        const response = await request(app)
            .get('/api/citas')
            .set('Authorization', authHeader());

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data[0].motivo).toBe('Control general');
    });

    it('retorna 400 cuando crear cita recibe datos invalidos', async () => {
        const response = await request(app)
            .post('/api/citas')
            .set('Authorization', authHeader())
            .send({
                id_paciente: '',
                id_medico: '',
                fecha_hora: '2020-01-01T10:00:00',
                motivo: ''
            });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.errors).toEqual(expect.any(Array));
    });

    it('crea cita cuando no existe conflicto de horario', async () => {
        queueQueryResults(
            mockQueryResult([]),
            mockQueryResult([{ id_cita: 20 }], [1])
        );

        const response = await request(app)
            .post('/api/citas')
            .set('Authorization', authHeader())
            .send({
                id_paciente: 1,
                id_medico: 1,
                fecha_hora: '2026-06-01T10:00:00',
                motivo: 'Control general',
                observaciones: 'Primera consulta'
            });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.id_cita).toBe(20);
    });

    it('retorna 409 cuando ya existe cita en ese horario', async () => {
        queueQueryResults(mockQueryResult([{ id_cita: 99 }]));

        const response = await request(app)
            .post('/api/citas')
            .set('Authorization', authHeader())
            .send({
                id_paciente: 1,
                id_medico: 1,
                fecha_hora: '2026-06-01T10:00:00',
                motivo: 'Control general'
            });

        expect(response.status).toBe(409);
        expect(response.body.success).toBe(false);
    });

    it('elimina cita por id', async () => {
        queueQueryResults(mockQueryResult([], [1]));

        const response = await request(app)
            .delete('/api/citas/1')
            .set('Authorization', authHeader());

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
    });
});
