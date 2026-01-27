const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ClienteSchema = new mongoose.Schema({
    empresa_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Empresa', required: true },
    nombre: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    cif_nif: { type: String, required: true },
    telefono: String,
    direccion: String,
    cambiar_password: { type: Boolean, default: true } // Importante
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