const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // <--- Importamos

const ClienteSchema = new mongoose.Schema({
    empresa_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Empresa', required: true },
    nombre: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    cif_nif: { type: String, required: true },
    telefono: String,
    direccion: String,
    //  NUEVO CAMPO: Indica si debe cambiar la contraseña (por defecto SÍ)
    cambiar_password: { type: Boolean, default: true } 
});

// MIDDLEWARE: Encriptar antes de guardar
ClienteSchema.pre('save', async function() {
    // Si la contraseña no se ha modificado, no hacemos nada
    if (!this.isModified('password')) return ;
    
    // Generamos la "sal" y encriptamos
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// MÉTODO: Para comparar contraseñas al hacer login
ClienteSchema.methods.compararPassword = async function(passwordIngresada) {
    return await bcrypt.compare(passwordIngresada, this.password);
};

module.exports = mongoose.model('Cliente', ClienteSchema);