const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const Cliente = require('../../models/Cliente');
const PageVisit = require('../models/PageVisit');

// Dashboard principal
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Estatísticas
    const totalClientes = await Cliente.countDocuments();
    const clientesHoje = await Cliente.countDocuments({
      createdAt: { $gte: today }
    });
    const totalVisitas = await PageVisit.countDocuments();
    const visitasHoje = await PageVisit.countDocuments({
      timestamp: { $gte: today }
    });

    // Lista de clientes (últimos 50)
    const clientes = await Cliente.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.render('dashboard', {
      username: req.session.username,
      stats: {
        totalClientes,
        clientesHoje,
        totalVisitas,
        visitasHoje
      },
      clientes
    });
  } catch (error) {
    console.error('Erro ao carregar dashboard:', error);
    res.status(500).render('error', { 
      message: 'Erro ao carregar dashboard',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

module.exports = router;
