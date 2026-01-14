const express = require('express');
const router = express.Router();
const facturaController = require('../controllers/facturaController');

// POST para crear factura
router.post('/', facturaController.crearFactura);

// GET para listar facturas de una empresa
router.get('/:empresaId', facturaController.obtenerFacturas);

module.exports = router;