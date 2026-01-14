const express = require('express');
const connectDB = require('./config/db'); // O donde tengas tu conexión
require('dotenv').config();

const app = express();

// 1. CONECTAR BASE DE DATOS
connectDB();

// =====================================================
// 🚨 ZONA CRÍTICA: EL ORDEN AQUÍ ES DE VIDA O MUERTE 🚨
// =====================================================

// 2. PRIMERO: Habilitar lectura de JSON
// (Si esto no va aquí, req.body será siempre undefined)
app.use(express.json()); 

// 3. DESPUÉS: Definir las rutas
app.use('/api/empresas', require('./routes/empresaRoutes'));
app.use('/api/clientes', require('./routes/clienteRoutes'));
app.use('/api/facturas', require('./routes/facturaRoutes'));

// =====================================================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});