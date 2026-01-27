const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');

console.log("✅ Rutas de Clientes cargadas");

// 1. RUTAS POST (Login y Crear)
router.post('/', clienteController.crearCliente);
router.post('/login', clienteController.loginCliente);

// 2. RUTAS GET ESPECÍFICAS (Tienen prioridad)
// Esta ruta busca los clientes de una empresa. 
// Tiene el prefijo '/empresa/' para no confundirse.
router.get('/empresa/:empresaId', clienteController.obtenerClientes);


// 3. RUTA GET GENÉRICA (Esta va DESPUÉS de las específicas)
// Esta ruta busca UN cliente por su ID (Para el perfil)
router.get('/:id', clienteController.obtenerClientePorId); 


// 4. RUTAS DE MODIFICACIÓN
router.put('/:id', clienteController.actualizarCliente);
router.delete('/:id', clienteController.eliminarCliente);

// 5. RUTAS DE CONTRASEÑAS
router.put('/cambiar-password/:id', clienteController.cambiarPasswordInicial);
router.put('/cambiar-password-seguro/:id', clienteController.cambiarPasswordSeguro);

module.exports = router;