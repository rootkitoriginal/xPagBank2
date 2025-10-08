const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const { isNotAuthenticated } = require('../middleware/auth');

// Página de login
router.get('/login', isNotAuthenticated, (req, res) => {
  res.render('login', { error: null });
});

// Processar login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validar campos
    if (!username || !password) {
      return res.render('login', { error: 'Preencha todos os campos' });
    }

    // Buscar admin
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.render('login', { error: 'Credenciais inválidas' });
    }

    // Verificar senha
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.render('login', { error: 'Credenciais inválidas' });
    }

    // Atualizar último login
    admin.lastLogin = new Date();
    await admin.save();

    // Criar sessão
    req.session.adminId = admin._id;
    req.session.username = admin.username;
    req.session.role = admin.role;

    res.redirect('/dashboard');
  } catch (error) {
    console.error('Erro no login:', error);
    res.render('login', { error: 'Erro ao fazer login. Tente novamente.' });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Erro ao fazer logout:', err);
    }
    res.redirect('/login');
  });
});

module.exports = router;
