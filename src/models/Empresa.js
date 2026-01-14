const mongoose = require('mongoose');

const EmpresaSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    cif_nif: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    direccion: { type: String },
    telefono: { type: String },
    logo: { type: String } 
});

module.exports = mongoose.model('Empresa', EmpresaSchema);