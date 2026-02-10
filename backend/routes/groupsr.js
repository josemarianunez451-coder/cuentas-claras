const express = require('express');
const router = express.Router();
// Importamos ambas funciones del controlador
const { createGroup, getUserGroups, getGroupById } = require('../controllers/groupController');
const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

// Proteger todas las rutas
router.use(ClerkExpressRequireAuth());

// Ruta para crear (POST)
router.post('/', createGroup);

// Ruta para obtener (GET) - Esto faltaba y causaba el 404 al cargar
router.get('/', getUserGroups);

router.get('/:id', getGroupById);


module.exports = router;