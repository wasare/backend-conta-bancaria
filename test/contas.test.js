const request = require("supertest");
const express = require("express");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient({ errorFormat: "minimal" });

const app = express();
const contasRoutes = require("../routes/contaRoutes");

app.use(express.json());
app.use('/contas', contasRoutes);

describe('Testa /contas', () => {

    beforeAll(async () => {
        await prisma.conta.deleteMany({});
    });

    afterAll(async () => {
        await prisma.conta.deleteMany({});
    });

    it('POST /contas', async () => {
        let conta = {
            titular: "Fulano",
            saldo: 1001
        };

        let response = await request(app).post('/contas').send(conta);
        expect(response.statusCode).toBe(200);
        expect(response.body.saldo).toBe(conta.saldo);

        response = await request(app).post('/contas').send({});
        expect(response.statusCode).toBe(500);

        conta.saldo = -1000000
        response = await request(app).post('/contas').send(conta);
        expect(response.statusCode).toBe(200);
        expect(response.body.saldo).toBe(conta.saldo);

    });

    it('GET /contas', async () => {
        const response = await request(app).get('/contas');
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(2);
    });

    it('GET /contas/{id}', async () => {
        let response = await request(app).get('/contas');
        expect(response.statusCode).toBe(200);
        let contaId = response.body[0].id;

        response = await request(app).get(`/contas/${contaId}`);
        expect(response.statusCode).toBe(200);

        response = await request(app).get(`/contas/${contaId + 10}`);
        expect(response.statusCode).toBe(404);

        response = await request(app).get('/contas/ABCD');
        expect(response.statusCode).toBe(500);
    });

    it('PUT /contas/{id}', async () => {
        let response = await request(app).get('/contas');
        expect(response.statusCode).toBe(200);
        let conta = response.body[0];

        conta.saldo = 0
        response = await request(app).put(`/contas/${conta.id}`).send(conta);
        expect(response.statusCode).toBe(200);
        expect(response.body.saldo).toBe(conta.saldo);

        response = await request(app).put(`/contas/${conta.id + 10}`).send({});
        console.log(response.body);
        expect(response.statusCode).toBe(500);
    });

    it('DELETE /contas/{id}', async () => {
        let response = await request(app).get('/contas');
        expect(response.statusCode).toBe(200);
        let conta = response.body[0];

        response = await request(app).delete(`/contas/${conta.id}`);
        expect(response.statusCode).toBe(200);

        response = await request(app).delete(`/contas/${conta.id + 10}`);
        expect(response.statusCode).toBe(500);

    });

});