
const express = require('express');
const router = express.Router();
// importamos la instancia de la clase 
const clienteController = require('../controllers/clienteController');

// Usamos la clase para manejar las rutas, cada método de la clase se encarga de una ruta específica
router.post('/', (req, res) => clienteController.crearCliente(req, res));
router.post('/login', (req, res) => clienteController.loginCliente(req, res));
// Clientes de una empresa (la empresa_id se manda por params, no por body para evitar que un cliente pueda cambiarse de empresa)
router.get('/empresa/:empresaId', (req, res) => clienteController.obtenerClientes(req, res));
// Un cliente específico por su ID
router.get('/:id', (req, res) => clienteController.obtenerClientePorId(req, res));
// Actualizar datos generales de un cliente 
router.put('/:id', (req, res) => clienteController.actualizarCliente(req, res));
// Eliminar cliente 
router.delete('/:id', (req, res) => clienteController.eliminarCliente(req, res));


// pide al html para cambuiar la contraseña
router.put('/cambiar-password/:id', (req, res) => clienteController.cambiarPasswordInicial(req, res));
// para cambiar la contraseña en el perfil
router.put('/cambiar-password-seguro/:id', (req, res) => clienteController.cambiarPasswordSeguro(req, res));

module.exports = router;