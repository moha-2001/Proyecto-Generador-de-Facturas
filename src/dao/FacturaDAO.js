const Factura = require('../models/Factura');

class FacturaDAO {

    // Crear factura
    async crear(datosFactura) {
        try {
            const nuevaFactura = new Factura(datosFactura);
            return await nuevaFactura.save();
        } catch (error) {
            throw new Error('Error al guardar la factura: ' + error.message);
        }
    }

    // Listar facturas de una empresa (con datos del cliente incluidos)
    async listarPorEmpresa(empresaId) {
        try {
            return await Factura.find({ empresa_id: empresaId })
                                .populate('cliente_id', 'nombre email cif_nif');
        } catch (error) {
            throw new Error('Error al listar facturas: ' + error.message);
        }
    }
}

module.exports = new FacturaDAO();