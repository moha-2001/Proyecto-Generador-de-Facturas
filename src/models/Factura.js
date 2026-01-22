const mongoose = require('mongoose');

const FacturaSchema = new mongoose.Schema({
    empresa_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Empresa', required: true },
    cliente_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
    numero: { type: String, required: true },
    estado: { type: String, enum: ['Pendiente', 'Pagada', 'Cancelada'], default: 'Pendiente' }, 
    fecha_emision: { type: Date, default: Date.now },
    fecha_vencimiento: { type: Date },
    items: [{
        concepto: { type: String, required: true },
        cantidad: { type: Number, required: true },
        precio_unitario: { type: Number, required: true },
        subtotal: { type: Number, required: true }
    }],
    subtotal: { type: Number, required: true }, // Suma de los subtotales de los items
    iva_amount: { type: Number, required: true },
    total: { type: Number, required: true },
    notas: { type: String }
});

module.exports = mongoose.model('Factura', FacturaSchema);