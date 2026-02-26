// src/routes/clienteRoutes.js
const express = require('express');
const router = express.Router();
// Importamos la instancia de la clase 
const clienteController = require('../controllers/clienteController');
// Importante: Usamos arrow function 
router.post('/', (req, res) => clienteController.crearCliente(req, res));
router.post('/login', (req, res) => clienteController.loginCliente(req, res));
// A) Clientes de una empresa
router.get('/empresa/:empresaId', (req, res) => clienteController.obtenerClientes(req, res));
// B) Un cliente específico (Perfil)
router.get('/:id', (req, res) => clienteController.obtenerClientePorId(req, res));
// Actualizar datos generales
router.put('/:id', (req, res) => clienteController.actualizarCliente(req, res));
// Eliminar cliente
router.delete('/:id', (req, res) => clienteController.eliminarCliente(req, res));


// ESTA ES LA QUE PIDE TU HTML
router.put('/cambiar-password/:id', (req, res) => clienteController.cambiarPasswordInicial(req, res));
// Esta es la de seguridad (cuando ya están logueados)
router.put('/cambiar-password-seguro/:id', (req, res) => clienteController.cambiarPasswordSeguro(req, res));

module.exports = router;