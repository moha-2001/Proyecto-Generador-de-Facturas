const express = require('express');
const connectDB = require('./config/db'); 
const path = require('path'); 
require('dotenv').config(); // Cargar variables de entorno lo primero

const app = express();

// CONECTAR BASE DE DATOS
connectDB();
app.use(express.json()); 

// La web se carga ANTES de las rutas
app.use(express.static('public'));

// Configuración para que se vean los PDFs
app.use('/facturas', express.static(path.join(__dirname, '../facturas')));

// RUTAS DE LA API 
app.use('/api/empresas', require('./routes/empresaRoutes'));
app.use('/api/clientes', require('./routes/clienteRoutes'));
app.use('/api/facturas', require('./routes/facturaRoutes'));

// ARRANCAR SERVIDOR
const PORT = process.env.PORT || 3000;

// En local puedes dejarlo sin IP específica
app.listen(PORT, '0.0.0.0', () => {
    console.log(` Servidor corriendo en puerto ${PORT}`);
});