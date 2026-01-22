const express = require('express');
const router = express.Router();
const facturaController = require('../controllers/facturaController');

// POST para crear factura
router.post('/', facturaController.crearFactura);

// GET para listar facturas de una empresa
router.get('/:empresaId', facturaController.obtenerFacturas);
router.get('/mis-facturas/:clienteId', facturaController.obtenerFacturasCliente);
router.patch('/:id/estado', facturaController.actualizarEstado);
router.delete('/:id', facturaController.eliminarFactura);
module.exports = router;