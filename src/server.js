const express = require('express');
const connectDB = require('./config/db'); 
require('dotenv').config();

const app = express();

//CONECTAR BASE DE DATOS
connectDB();


app.use(express.json()); 

//Definir las rutas
app.use('/api/empresas', require('./routes/empresaRoutes'));
app.use('/api/clientes', require('./routes/clienteRoutes'));
app.use('/api/facturas', require('./routes/facturaRoutes'));


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(` Servidor corriendo en puerto ${PORT}`);
});
app.use(express.static('public'));
const path = require('path');
app.use('/facturas', express.static(path.join(__dirname, '../facturas')));