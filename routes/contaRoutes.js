const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');

const router = express.Router();
const prisma = new PrismaClient();

const validateAccount = [
  body('titular').isString().withMessage('Titular must be a string'),
  body('saldo').isNumeric().withMessage('Saldo must be a number'),
];

router.post('/', validateAccount, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { titular, saldo } = req.body;
  try {
    const novaConta = await prisma.conta.create({
      data: { titular, saldo },
    });
    res.status(201).json(novaConta);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar conta', details: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const contas = await prisma.conta.findMany({ where: { excluida: false } });
    res.json(contas);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar contas', details: error.message });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const conta = await prisma.conta.findUnique({ where: { id: parseInt(id) } });
    if (!conta || conta.excluida) {
      return res.status(404).json({ error: 'Conta não encontrada' });
    }
    res.json(conta);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar conta', details: error.message });
  }
});

router.put('/:id', validateAccount, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { titular, saldo } = req.body;
  try {
    const contaAtualizada = await prisma.conta.update({
      where: { id: parseInt(id) },
      data: { titular, saldo },
    });
    res.json(contaAtualizada);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar conta', details: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const contaExcluida = await prisma.conta.update({
      where: { id: parseInt(id) },
      data: { excluida: true },
    });
    res.json({ message: 'Conta desativada', conta: contaExcluida });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao desativar a conta', details: error.message });
  }
});

module.exports = router;
