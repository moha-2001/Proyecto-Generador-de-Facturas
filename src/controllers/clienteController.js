const ClienteDAO = require('../dao/ClienteDAO');
const bcrypt = require('bcryptjs');


const loginCliente = async (req, res) => {
    try {
        const { email, password } = req.body;
        const Cliente = require('../models/Cliente');
        const cliente = await Cliente.findOne({ email: email });
        if (!cliente) {
            return res.status(401).json({ error: 'Email no encontrado' });
        }
        let esCorrecta = false;
        if (cliente.password === password) {
            esCorrecta = true;
        } else {
            try {
                esCorrecta = await bcrypt.compare(password, cliente.password);
            } catch (e) {
                esCorrecta = false;
            }
        }
        if (!esCorrecta) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }
        res.json({ 
            mensaje: 'Login correcto', 
            id: cliente._id,
            nombre: cliente.nombre,
            tipo: 'cliente',
            requiereCambio: cliente.cambiar_password 
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
        const { id } = req.params;
        const Cliente = require('../models/Cliente'); 
        const cliente = await Cliente.findById(id);
        if (!cliente) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }
        res.json(cliente);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};

//  Actualizar Cliente
const actualizarCliente = async (req, res) => {
    try {
        const { id } = req.params;
        const datosActualizados = req.body;
        const Cliente = require('../models/Cliente');
        delete datosActualizados.password; 
        delete datosActualizados.empresa_id; 
        // Buscamos y actualizamos
        const cliente = await Cliente.findByIdAndUpdate(id, datosActualizados, { new: true });

        if (!cliente) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }

        res.json({ mensaje: 'Datos actualizados correctamente', cliente });

    } catch (error) {
        console.error("Error actualizando cliente:", error);
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
const cambiarPasswordSeguro = async (req, res) => {
    try {
        const { id } = req.params;
        const { passwordActual, passwordNueva } = req.body;
        
        const Cliente = require('../models/Cliente');
        const cliente = await Cliente.findById(id);

        if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });

        // 1. Verificar contraseña actual (Híbrido: Texto plano o Hash)
        let esCorrecta = false;
        if (cliente.password === passwordActual) {
            esCorrecta = true;
        } else {
            try {
                esCorrecta = await bcrypt.compare(passwordActual, cliente.password);
            } catch (e) { esCorrecta = false; }
        }

        if (!esCorrecta) {
            return res.status(400).json({ error: 'La contraseña actual no es correcta' });
        }

        // 2. Guardar nueva (El modelo se encargará de encriptarla con el pre-save)
        cliente.password = passwordNueva;
        cliente.cambiar_password = false; // Ya no es necesario cambiarla
        await cliente.save();

        res.json({ mensaje: 'Contraseña actualizada correctamente' });

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
    eliminarCliente,
    cambiarPasswordSeguro
};