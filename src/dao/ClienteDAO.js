const Cliente = require('../models/Cliente');

class ClienteDAO {
    // Crear un nuevo cliente
    async crear(datosCliente) {
        try {
            const nuevoCliente = new Cliente(datosCliente);
            return await nuevoCliente.save();
        } catch (error) {
            throw new Error('Error al crear el cliente en la base de datos: ' + error.message);
        }
    }

    // Listar todos los clientes de una empresa específica
    async listarPorEmpresa(empresaId) {
        try {
            return await Cliente.find({ empresa_id: empresaId });
        } catch (error) {
            throw new Error('Error al obtener los clientes: ' + error.message);
        }
    }

    // Buscar un cliente por su ID
    async buscarPorId(id) {
        try {
            return await Cliente.findById(id);
        } catch (error) {
            throw new Error('Cliente no encontrado');
        }
    }

    // Actualizar datos de un cliente
    async actualizar(id, nuevosDatos) {
        try {
            return await Cliente.findByIdAndUpdate(id, nuevosDatos, { new: true });
        } catch (error) {
            throw new Error('Error al actualizar el cliente');
        }
    }

    // Eliminar un cliente
    async eliminar(id) {
        try {
            return await Cliente.findByIdAndDelete(id);
        } catch (error) {
            throw new Error('Error al eliminar el cliente');
        }
    }
}

module.exports = new ClienteDAO();