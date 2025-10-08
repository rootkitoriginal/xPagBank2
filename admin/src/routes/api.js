const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const Cliente = require('../../models/Cliente');
const PageVisit = require('../models/PageVisit');

// GET estatísticas
router.get('/stats', isAuthenticated, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = {
      totalClientes: await Cliente.countDocuments(),
      clientesHoje: await Cliente.countDocuments({
        createdAt: { $gte: today }
      }),
      totalVisitas: await PageVisit.countDocuments(),
      visitasHoje: await PageVisit.countDocuments({
        timestamp: { $gte: today }
      })
    };

    res.json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

// GET lista de clientes
router.get('/clientes', isAuthenticated, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const clientes = await Cliente.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Cliente.countDocuments();

    res.json({
      clientes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({ error: 'Erro ao buscar clientes' });
  }
});

// GET detalhes de um cliente
router.get('/clientes/:id', isAuthenticated, async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id).lean();
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    res.json(cliente);
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({ error: 'Erro ao buscar cliente' });
  }
});

module.exports = router;
