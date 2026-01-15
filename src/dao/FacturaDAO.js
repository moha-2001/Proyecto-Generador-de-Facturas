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
    async listarPorCliente(clienteId) {
    try {
        return await Factura.find({ cliente_id: clienteId }).populate('empresa_id', 'nombre');
    } catch (error) { throw new Error('Error buscando facturas de cliente'); }
    }
    // Buscar una factura por ID con todos sus detalles (Empresa y Cliente)
    async buscarPorId(id) {
        try {
            return await Factura.findById(id)
                .populate('cliente_id')  // Trae datos del cliente
                .populate('empresa_id'); // <--- ¡AÑADE ESTO! (Trae datos de la empresa)
        } catch (error) {
            throw new Error('Factura no encontrada');
        }
    }
}

module.exports = new FacturaDAO();