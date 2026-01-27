const ClienteDAO = require('../dao/ClienteDAO');
const ClienteFactory = require('../factories/ClienteFactory'); // ¡Usamos Factory!
const bcrypt = require('bcryptjs');

// 🟢 CAMBIO IMPORTANTE: Ahora es una CLASE (POO)
class ClienteController {

    async loginCliente(req, res) {
        try {
            const { email, password } = req.body;
            // 🟢 USAMOS DAO, NO MODELO
            const cliente = await ClienteDAO.buscarPorEmail(email);
            
            if (!cliente) return res.status(401).json({ error: 'Email no encontrado' });

            // Verificación contraseña
            let esCorrecta = false;
            if (cliente.password === password) {
                esCorrecta = true;
            } else {
                try {
                    esCorrecta = await bcrypt.compare(password, cliente.password);
                } catch (e) { esCorrecta = false; }
            }

            if (!esCorrecta) return res.status(401).json({ error: 'Contraseña incorrecta' });

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
    }

    async crearCliente(req, res) {
        try {
            // 🟢 USAMOS FACTORY PARA PREPARAR DATOS
            const datosLimpios = ClienteFactory.crearCliente(req.body);
            
            // 🟢 USAMOS DAO PARA GUARDAR
            const clienteGuardado = await ClienteDAO.crear(datosLimpios);
            
            res.status(201).json({ 
                mensaje: '¡Cliente creado con éxito!', 
                cliente: clienteGuardado 
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async obtenerClientes(req, res) {
        try {
            const { empresaId } = req.params; 
            const clientes = await ClienteDAO.listarPorEmpresa(empresaId);
            res.json(clientes);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async obtenerClientePorId(req, res) {
        try {
            const cliente = await ClienteDAO.buscarPorId(req.params.id);
            if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
            res.json(cliente);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async actualizarCliente(req, res) {
        try {
            const { id } = req.params;
            const datos = req.body;
            // Seguridad: quitamos campos sensibles
            delete datos.password;
            delete datos.empresa_id;

            const cliente = await ClienteDAO.actualizar(id, datos);
            if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });

            res.json({ mensaje: 'Actualizado', cliente });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async eliminarCliente(req, res) {
        try {
            await ClienteDAO.eliminar(req.params.id);
            res.json({ mensaje: 'Cliente eliminado correctamente' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Métodos de contraseña...
    async cambiarPasswordSeguro(req, res) {
        try {
            const { id } = req.params;
            const { passwordActual, passwordNueva } = req.body;
            
            const cliente = await ClienteDAO.buscarPorId(id);
            if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });

            // Verificar actual
            let esCorrecta = false;
            if (cliente.password === passwordActual) esCorrecta = true;
            else esCorrecta = await bcrypt.compare(passwordActual, cliente.password);
            
            if (!esCorrecta) return res.status(400).json({ error: 'Contraseña actual incorrecta' });

            // Actualizar (Usamos el DAO para actualizar)
            // Nota: Aquí dependemos de que el pre-save hook del Modelo haga el hash, 
            // o lo hasheamos aquí. Para simplificar, enviamos al DAO.
            await ClienteDAO.actualizar(id, { 
                password: passwordNueva, 
                cambiar_password: false 
            });

            res.json({ mensaje: 'Contraseña actualizada' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new ClienteController();