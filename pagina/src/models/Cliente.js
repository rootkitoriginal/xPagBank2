const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    containerName: {
        type: String,
        default: null
    },
    ports: {
        vnc: {
            type: Number,
            default: null
        },
        app: {
            type: Number,
            default: null
        }
    },
    reused: {
        type: Boolean,
        default: false
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    loginCount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Índice para otimizar buscas por username
clienteSchema.index({ username: 1 });

const Cliente = mongoose.model('Cliente', clienteSchema);

module.exports = Cliente;
