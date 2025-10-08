const PageVisit = require('../models/PageVisit');

// Middleware para rastrear visitas
const trackPageVisit = async (req, res, next) => {
  try {
    const visit = new PageVisit({
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      page: req.path,
      sessionId: req.sessionID || req.session?.id
    });
    
    await visit.save();
  } catch (error) {
    // Não bloqueia a requisição se houver erro ao salvar
    console.error('Erro ao registrar visita:', error.message);
  }
  
  next();
};

module.exports = trackPageVisit;
