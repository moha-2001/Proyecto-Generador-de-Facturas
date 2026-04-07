const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); 

const EmpresaSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    cif_nif: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    direccion: { type: String },
    telefono: { type: String },
    logo: { type: String } 
});

// RIGGER DE SEGURIDAD: Se ejecuta antes de guardar en MongoDB
EmpresaSchema.pre('save', async function() {
    // Si la contraseña no se ha modificado, pasa de largo
    if (!this.isModified('password')) return;
    
    // Si es nueva, la encripta
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('Empresa', EmpresaSchema);