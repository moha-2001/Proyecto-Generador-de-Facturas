const mongoose = require('javascript');

const NotificacionSchema = new mongoose.Schema({
    empresa_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Empresa', required: true },
    cliente_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
    factura_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Factura' },
    leido: { type: Boolean, default: false },
    mensaje: { type: String, required: true },
    fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notificacion', NotificacionSchema);