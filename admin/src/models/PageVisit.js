const mongoose = require('mongoose');

const pageVisitSchema = new mongoose.Schema({
  ip: {
    type: String,
    required: true
  },
  userAgent: String,
  page: {
    type: String,
    default: 'home'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  sessionId: String
});

// Index para melhorar performance nas queries de estatísticas
pageVisitSchema.index({ timestamp: -1 });
pageVisitSchema.index({ ip: 1, timestamp: -1 });

module.exports = mongoose.model('PageVisit', pageVisitSchema);
