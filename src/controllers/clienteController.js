const ClienteDAO = require('../dao/ClienteDAO');
// Añadir al principio: const ClienteDAO = require('../dao/ClienteDAO');
const bcrypt = require('bcryptjs');
const loginCliente = async (req, res) => {
    try {
        const { email, password } = req.body;
        const cliente = await ClienteDAO.buscarPorEmail(email);

        if (!cliente) {
            return res.status(401).json({ error: 'Usuario no encontrado' });
        }

        // ✅ Usamos el método seguro para comparar
        const esCorrecta = await cliente.compararPassword(password);
        if (!esCorrecta) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        // ✅ DETECTAR SI REQUIERE CAMBIO DE CONTRASEÑA
        if (cliente.cambiar_password) {
            return res.json({
                mensaje: 'Login correcto, pero requiere cambio de pass',
                id: cliente._id,
                nombre: cliente.nombre,
                tipo: 'cliente',
                requiereCambio: true // <--- AVISO AL FRONTEND
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
        
        // Buscamos al cliente (Usamos el modelo directo o DAO si tienes método actualizar)
        const Cliente = require('../models/Cliente'); 
        const cliente = await Cliente.findById(id);

        if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });

        // Actualizamos
        cliente.password = nuevaPassword; // El pre('save') del modelo la encriptará sola
        cliente.cambiar_password = false; // Ya no necesita cambiarla
        await cliente.save();

        res.json({ mensaje: 'Contraseña actualizada correctamente' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//  Obtener un cliente por ID (Para rellenar el formulario de edición)
const obtenerClientePorId = async (req, res) => {
    try {
        const cliente = await ClienteDAO.buscarPorId(req.params.id); // Asegúrate de tener este método en DAO o usa Cliente.findById
        // Si no tienes el método en DAO, usa esto directo:
        // const Cliente = require('../models/Cliente');
        // const cliente = await Cliente.findById(req.params.id);
        
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
    obtenerClientePorId, // <--- Nuevo
    actualizarCliente,   // <--- Nuevo
    eliminarCliente      // <--- Nuevo
};
module.exports = { crearCliente, obtenerClientes, loginCliente, cambiarPasswordInicial, eliminarCliente, actualizarCliente, obtenerClientePorId };