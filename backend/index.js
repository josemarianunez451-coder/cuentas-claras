// backend/index.js
require('dotenv').config(); // Para leer las variables de .env
const express = require('express');
const cors = require('cors');

// Crea la aplicación de Express
const app = express();

// Middlewares
app.use(cors({ origin: 'http://localhost:5173' })); // Permite peticiones del frontend
app.use(express.json()); // Permite a Express entender JSON en el body de las peticiones

// UNA RUTA DE PRUEBA BÁSICA
app.get('/api', (req, res) => {
  res.json({ message: '¡El backend está funcionando correctamente!' });
});

// Define el puerto
const PORT = process.env.PORT || 4000;

// Inicia el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});