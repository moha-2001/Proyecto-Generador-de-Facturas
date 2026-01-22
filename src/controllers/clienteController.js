const ClienteDAO = require('../dao/ClienteDAO');
const bcrypt = require('bcryptjs');
const loginCliente = async (req, res) => {
    try {
        const { email, password } = req.body;
        const cliente = await ClienteDAO.buscarPorEmail(email);

        if (!cliente) {
            return res.status(401).json({ error: 'Usuario no encontrado' });
        }
        const esCorrecta = await cliente.compararPassword(password);
        if (!esCorrecta) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }
        if (cliente.cambiar_password) {
            return res.json({
                mensaje: 'Login correcto, pero requiere cambio de pass',
                id: cliente._id,
                nombre: cliente.nombre,
                tipo: 'cliente',
                requiereCambio: true
            });
        }

        res.json({ 
            mensaje: 'Login correcto', 
            id: cliente._id,
            nombre: cliente.nombre,
            tipo: 'cliente',
            requiereCambio: false
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

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

// 2.  FUNCIÓN ACTUALIZAR CONTRASEÑA
const cambiarPasswordInicial = async (req, res) => {
    try {
        const { id } = req.params;
        const { nuevaPassword } = req.body;
                const Cliente = require('../models/Cliente'); 
        const cliente = await Cliente.findById(id);

        if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
        cliente.password = nuevaPassword; 
        cliente.cambiar_password = false; 
        await cliente.save();

        res.json({ mensaje: 'Contraseña actualizada correctamente' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//  Obtener un cliente por ID (Para rellenar el formulario de edición)
const obtenerClientePorId = async (req, res) => {
    try {
        const cliente = await ClienteDAO.buscarPorId(req.params.id); 
        if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
        res.json(cliente);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//  Actualizar Cliente
const actualizarCliente = async (req, res) => {
    try {
        const { id } = req.params;
        const datos = req.body;
        
        // Importamos el modelo directamente para usar findByIdAndUpdate
        const Cliente = require('../models/Cliente');
        
        // Evitamos sobreescribir la contraseña si no se envía
        if (!datos.password) delete datos.password;

        const clienteActualizado = await Cliente.findByIdAndUpdate(id, datos, { new: true });
        res.json({ mensaje: 'Cliente actualizado', cliente: clienteActualizado });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//  Eliminar Cliente
const eliminarCliente = async (req, res) => {
    try {
        const Cliente = require('../models/Cliente');
        await Cliente.findByIdAndDelete(req.params.id);
        res.json({ mensaje: 'Cliente eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ACTUALIZA EL EXPORT FINAL ASÍ:
module.exports = { 
    crearCliente, 
    obtenerClientes, 
    loginCliente, 
    cambiarPasswordInicial,
    obtenerClientePorId, 
    actualizarCliente,   
    eliminarCliente      
};
module.exports = { crearCliente, obtenerClientes, loginCliente, cambiarPasswordInicial, eliminarCliente, actualizarCliente, obtenerClientePorId };