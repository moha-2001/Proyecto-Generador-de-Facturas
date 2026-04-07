const Cliente = require('../models/Cliente'); // Importamos directamente el Modelo
const bcrypt = require('bcryptjs');

class ClienteController {
    async loginCliente(req, res) {
        try {
            const { email, password } = req.body;
            //  Búsqueda directa con Mongoose
            const cliente = await Cliente.findOne({ email: email });
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
            // Si al crear el cliente no le mandan contraseña, le ponemos el CIF por defecto
            if (!req.body.password) {
                req.body.password = req.body.cif_nif; 
            }
            // Guardado directo con Mongoose (El Modelo encriptará la password automáticamente)
            const nuevoCliente = new Cliente(req.body);
            const clienteGuardado = await nuevoCliente.save();
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
            // Buscar todos los clientes de esa empresa
            const clientes = await Cliente.find({ empresa_id: empresaId });
            res.json(clientes);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async obtenerClientePorId(req, res) {
        try {
            const cliente = await Cliente.findById(req.params.id);
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
            // Seguridad: evitamos que cambien la contraseña o la empresa por este método
            delete datos.password;
            delete datos.empresa_id;
            // Actualización directa con Mongoose
            const cliente = await Cliente.findByIdAndUpdate(id, datos, { new: true });
            if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
            res.json({ mensaje: 'Actualizado', cliente });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async eliminarCliente(req, res) {
        try {
            // Eliminación directa con Mongoose
            await Cliente.findByIdAndDelete(req.params.id);
            res.json({ mensaje: 'Cliente eliminado correctamente' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // --- Métodos de Contraseña ---
    async cambiarPasswordInicial(req, res) {
        try {
            const { id } = req.params;
            const { nuevaPassword } = req.body;
            // Validación de seguridad (Regex)
            const passwordRegex = /^[A-Z](?=.*\d)(?=.*[\W_]).{7,}$/;
            if (!passwordRegex.test(nuevaPassword)) {
                return res.status(400).json({ 
                    error: 'La contraseña debe tener mínimo 8 caracteres, EMPEZAR por mayúscula, y tener un número y un carácter especial.' 
                });
            }
            // 1. Buscamos el cliente
            const cliente = await Cliente.findById(id);
            if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
            // 2. Le asignamos la nueva contraseña (en texto plano) y le quitamos el aviso
            cliente.password = nuevaPassword;
            cliente.cambiar_password = false;
            // 3. Al hacer .save(), el Mongoose salta y encripta la contraseña automáticamente
            await cliente.save();

            res.json({ mensaje: 'Contraseña actualizada correctamente' });
        } catch (error) {
            console.error("Error en cambiarPasswordInicial:", error);
            res.status(500).json({ error: error.message });
        }
    }

    async cambiarPasswordSeguro(req, res) {
        try {
            const { id } = req.params;
            const { passwordActual, passwordNueva } = req.body;
            const cliente = await Cliente.findById(id);
            if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
            // Verificar contraseña actual
            let esCorrecta = false;
            if (cliente.password === passwordActual) esCorrecta = true;
            else esCorrecta = await bcrypt.compare(passwordActual, cliente.password);
            if (!esCorrecta) return res.status(400).json({ error: 'Contraseña actual incorrecta' });
            // Le asignamos la nueva contraseña en plano. Mongoose la encriptará al guardar.
            cliente.password = passwordNueva;
            cliente.cambiar_password = false; 
            await cliente.save();
            res.json({ mensaje: 'Contraseña actualizada' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
module.exports = new ClienteController();