require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');

const app = express();

// Conectar a la base de datos
connectDB();

// Middleware para leer JSON
app.use(express.json());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));