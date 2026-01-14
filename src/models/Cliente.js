const mongoose = require('mongoose');

const ClienteSchema = new mongoose.Schema({
    empresa_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Empresa', required: true },
    nombre: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    telefono: { type: String },
    direccion: { type: String }
});

module.exports = mongoose.model('Cliente', ClienteSchema);