const express = require('express');
const dockerService = require('../services/dockerService');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get(
  '/pagbank/api/v1/login',
  asyncHandler(async (req, res) => {
    const { username, senha } = req.query;
    const expectedUsername = process.env.PAGBANK_USERNAME;
    const expectedPassword = process.env.PAGBANK_PASSWORD;

    if (!username || !senha) {
      return res.status(400).json({
        error: 'Both username and senha query parameters are required.'
      });
    }

    if (
      (expectedUsername && username !== expectedUsername) ||
      (expectedPassword && senha !== expectedPassword)
    ) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const session = await dockerService.startUserContainer(username);

    const message = session.reused
      ? 'Container já está rodando para este usuário.'
      : 'Container iniciado com sucesso!';

    return res.render('login-success', {
      username,
      message,
      reused: session.reused,
      containerName: session.containerName,
      ports: session.ports,
      startedAt: new Date(session.startedAt).toLocaleString('pt-BR')
    });
  })
);

router.get(
  '/pagbank/api/v1/logout',
  asyncHandler(async (req, res) => {
    const { username } = req.query;
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
      return res.status(404).render('logout-error', { username });
    }

    return res.render('logout-success', {
      username,
      containerName: result.containerName
    });
  })
);

module.exports = router;
