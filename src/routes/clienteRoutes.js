
const express = require('express');
const router = express.Router();
// importamos la instancia de la clase 
const clienteController = require('../controllers/clienteController');

// Usamos arrow function 
router.post('/', (req, res) => clienteController.crearCliente(req, res));
router.post('/login', (req, res) => clienteController.loginCliente(req, res));
// Clientes de una empresa
router.get('/empresa/:empresaId', (req, res) => clienteController.obtenerClientes(req, res));
// Un cliente específico 
router.get('/:id', (req, res) => clienteController.obtenerClientePorId(req, res));
// Actualizar datos generales
router.put('/:id', (req, res) => clienteController.actualizarCliente(req, res));
// Eliminar cliente
router.delete('/:id', (req, res) => clienteController.eliminarCliente(req, res));


// ESTA ES LA QUE PIDE  HTML para cambuiar la contraseña
router.put('/cambiar-password/:id', (req, res) => clienteController.cambiarPasswordInicial(req, res));
// Esta es la de seguridad para cambiar la contraseña en el perfil
router.put('/cambiar-password-seguro/:id', (req, res) => clienteController.cambiarPasswordSeguro(req, res));

module.exports = router;