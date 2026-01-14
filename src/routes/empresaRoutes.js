const express = require('express');
const router = express.Router();
const empresaController = require('../controllers/empresaController');

// Ruta POST para registrar empresa: http://localhost:3000/api/empresas
router.post('/', empresaController.registrarEmpresa);

module.exports = router;