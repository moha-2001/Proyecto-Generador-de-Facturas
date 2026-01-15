const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');

// Rutas POST
router.post('/', clienteController.crearCliente);
router.post('/login', clienteController.loginCliente);

// Rutas GET
// 1. RUTA ESPECÍFICA (Ponla ANTES de las genéricas para evitar líos)
router.get('/detalle/:id', clienteController.obtenerClientePorId); // <--- CAMBIO AQUÍ

// 2. RUTA GENÉRICA (Listar por empresa)
router.get('/:empresaId', clienteController.obtenerClientes);

// Rutas PUT/DELETE
router.put('/:id', clienteController.actualizarCliente);
router.delete('/:id', clienteController.eliminarCliente);
router.put('/cambiar-password/:id', clienteController.cambiarPasswordInicial);

module.exports = router;