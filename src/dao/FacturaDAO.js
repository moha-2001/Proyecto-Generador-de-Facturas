const Factura = require('../models/Factura');

class FacturaDAO {
    async crear(datosFactura) {
        try {
            const nuevaFactura = new Factura(datosFactura);
            return await nuevaFactura.save();
        } catch (error) {
            throw new Error('Error DAO al crear factura: ' + error.message);
        }
    }

    async listarPorEmpresa(empresaId) {
        return await Factura.find({ empresa_id: empresaId })
                            .populate('cliente_id', 'nombre email cif_nif');
    }

    async listarPorCliente(clienteId) {
        return await Factura.find({ cliente_id: clienteId })
                            .populate('empresa_id', 'nombre');
    }

    async buscarPorId(id) {
        return await Factura.findById(id)
            .populate('cliente_id')
            .populate('empresa_id');
    }
    
    async actualizarEstado(id, nuevoEstado) {
        return await Factura.findByIdAndUpdate(
            id, 
            { estado: nuevoEstado }, 
            { new: true }
        );
    }

    async eliminar(id) {
        return await Factura.findByIdAndDelete(id);
    }
}

module.exports = new FacturaDAO();