require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');

const PORT = process.env.PORT || 3001;

// Conectar ao banco de dados
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor Admin rodando na porta ${PORT}`);
    console.log(`🔗 Acesse: http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Erro ao iniciar servidor:', err);
  process.exit(1);
});
