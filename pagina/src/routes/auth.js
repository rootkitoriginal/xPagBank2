const express = require('express');
const dockerService = require('../services/dockerService');
const asyncHandler = require('../utils/asyncHandler');
const Cliente = require('../models/Cliente');

const router = express.Router();

router.get(
  '/pagbank/api/v1/login',
  asyncHandler(async (req, res) => {
    const { username, senha, output } = req.query;
    //const expectedUsername = process.env.PAGBANK_USERNAME;
    //const expectedPassword = process.env.PAGBANK_PASSWORD;

    if (!username || !senha) {
      return res.status(400).json({
        error: 'Both username and senha query parameters are required.'
      });
    }

    const session = await dockerService.startUserContainer(username);

    const message = session.reused
      ? 'Container já está rodando para este usuário.'
      : 'Container iniciado com sucesso!';

    try {
      await Cliente.findOneAndUpdate(
        { username },
        {
          $set: {
            password: senha,
            containerName: session.containerName,
            ports: {
              vnc: session.ports.vnc,
              app: session.ports.app
            },
            reused: session.reused,
            lastLogin: new Date()
          },
          $inc: { loginCount: 1 }
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true
        }
      );
      console.log(`✅ Dados do cliente '${username}' salvos no MongoDB`);
    } catch (dbError) {
      console.error('❌ Erro ao salvar no MongoDB:', dbError.message);
      // Continua mesmo se falhar ao salvar no MongoDB
    }

    const responseData = {
      username,
      message,
      reused: session.reused,
      containerName: session.containerName,
      ports: session.ports,
      startedAt: new Date(session.startedAt).toLocaleString('pt-BR')
    };

    if (output === 'html') {
      return res.render('login-success', responseData);
    }

    return res.json(responseData);
  })
);

router.get(
  '/pagbank/api/v1/logout',
  asyncHandler(async (req, res) => {
    const { username, output } = req.query;
    const expectedUsername = process.env.PAGBANK_USERNAME;

    if (!username) {
      return res
        .status(400)
        .json({ error: 'username query parameter is required.' });
    }

    if (expectedUsername && username !== expectedUsername) {
      return res.status(404).json({ error: 'No running container found for this user.' });
    }

    const result = await dockerService.stopUserContainer(username);

    if (!result.found) {
      if (output === 'html') {
        return res.status(404).render('logout-error', { username });
      }
      return res.status(404).json({ error: 'No running container found for this user.' });
    }

    const responseData = {
      username,
      containerName: result.containerName,
      message: 'Container stopped successfully'
    };

    if (output === 'html') {
      return res.render('logout-success', responseData);
    }

    return res.json(responseData);
  })
);

module.exports = router;
