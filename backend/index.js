require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Conectar a la base de datos
connectDB();

const app = express();

// Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/api', (req, res) => res.json({ msg: 'API funcionando' }));

// CORRECCIÓN IMPORTANTE: Cambiado 'Groups' a 'groups' (minúscula)
app.use('/api/groups', require('./routes/groupsr'));

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

module.exports = app;
