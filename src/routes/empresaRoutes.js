const express = require('express');
const router = express.Router();
const empresaController = require('../controllers/empresaController');

// Ruta POST para registrar empresa: http://localhost:3000/api/empresas
router.post('/', empresaController.registrarEmpresa);
router.get('/:id', empresaController.obtenerEmpresa);
router.put('/:id', empresaController.actualizarEmpresa);
router.post('/login', empresaController.loginEmpresa);

module.exports = router;