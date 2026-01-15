const Empresa = require('../models/Empresa');

class EmpresaDAO {
    
    // Registrar una nueva empresa
    async crear(datosEmpresa) {
        try {
            const nuevaEmpresa = new Empresa(datosEmpresa);
            return await nuevaEmpresa.save();
        } catch (error) {
            throw new Error('Error al registrar la empresa: ' + error.message);
        }
    }

    // Buscar si ya existe un email (para login)
    async buscarPorEmail(email) {
        try {
            return await Empresa.findOne({ email: email });
        } catch (error) {
            throw new Error('Error al buscar empresa');
        }
    }

    // Buscar por ID
    async buscarPorId(id) {
        try {
            return await Empresa.findById(id);
        } catch (error) {
            throw new Error('Empresa no encontrada');
        }
    }
    async actualizar(id, nuevosDatos) {
    try {
        return await Empresa.findByIdAndUpdate(id, nuevosDatos, { new: true });
    } catch (error) {
        throw new Error('Error al actualizar empresa');
    }
}
}

module.exports = new EmpresaDAO();