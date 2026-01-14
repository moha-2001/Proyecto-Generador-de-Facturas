const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');

// Ruta para crear cliente (POST /api/clientes)
router.post('/', clienteController.crearCliente);

// Ruta para ver clientes de una empresa (GET /api/clientes/:empresaId)
router.get('/:empresaId', clienteController.obtenerClientes);

module.exports = router;