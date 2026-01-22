const express = require('express');
const router = express.Router();
const empresaController = require('../controllers/empresaController');

router.post('/', empresaController.registrarEmpresa);
router.get('/:id', empresaController.obtenerEmpresa);
router.put('/:id', empresaController.actualizarEmpresa);
router.post('/login', empresaController.loginEmpresa);
router.put('/cambiar-password/:id', empresaController.cambiarPassword);

module.exports = router;