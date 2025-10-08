// Modelo Cliente para o admin (espelhado do projeto principal)
const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  cpf: {
    type: String,
    required: true,
    unique: true
  },
  telefone: String,
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: String,
  containerName: String,
  containerPort: Number,
  ports: {
    vnc: Number,
    app: Number
  },
  reused: Boolean,
  lastLogin: Date,
  loginCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Usar o mesmo nome de collection que o projeto principal
module.exports = mongoose.model('Cliente', clienteSchema, 'clientes');
