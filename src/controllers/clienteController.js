const ClienteDAO = require('../dao/ClienteDAO');

// Crear un cliente nuevo
const crearCliente = async (req, res) => {
    try {
        const clienteGuardado = await ClienteDAO.crear(req.body);
        res.status(201).json({ 
            mensaje: '¡Cliente creado con éxito!', 
            cliente: clienteGuardado 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener clientes de una empresa
const obtenerClientes = async (req, res) => {
    try {
        const { empresaId } = req.params; 
        const clientes = await ClienteDAO.listarPorEmpresa(empresaId);
        res.json(clientes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { crearCliente, obtenerClientes };