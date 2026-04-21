const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
// Define la estructura exacta, los tipos de datos y las reglas de validación 
// que debe cumplir un clinte  antes de guardarse en la base de datos MongoDB
const ClienteSchema = new mongoose.Schema({ // Cada cliente pertenece a una empresa
    empresa_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Empresa', required: true },
    nombre: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    cif_nif: { type: String, required: true },
    telefono: String,
    direccion: String,
    cambiar_password: { type: Boolean, default: true } 
});
ClienteSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});
ClienteSchema.methods.compararPassword = async function(passwordIngresada) {
    return await bcrypt.compare(passwordIngresada, this.password);
};
module.exports = mongoose.model('Cliente', ClienteSchema);