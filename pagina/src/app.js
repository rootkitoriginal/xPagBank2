const express = require('express');
const morgan = require('morgan');
const path = require('path');
const authRoutes = require('./routes/auth');
const cors = require('cors');
const connectDB = require('./config/database');
const trackPageVisit = require('./middleware/trackVisit');

// Conectar ao MongoDB
connectDB();

const app = express();

// Configurar EJS como template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(morgan('dev'));
app.use(express.json());

// Middleware para rastrear visitas nas páginas principais
app.use('/', trackPageVisit);

app.get('/', (req, res) => {
  res.render('portal');
});

app.get('/healthz', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(authRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.use((err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

module.exports = app;
