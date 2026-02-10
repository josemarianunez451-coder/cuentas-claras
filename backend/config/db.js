// backend/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  // Primero, verifica si la variable de entorno está cargada
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    console.error('ERROR: La variable de entorno MONGO_URI no está definida.');
    console.log('Asegúrate de tener un archivo .env en la carpeta /backend con MONGO_URI=tu_cadena_de_conexion');
    process.exit(1); // Detiene la aplicación si la variable no existe
  }

  console.log('Intentando conectar a MongoDB...'); // Mensaje para saber que el proceso empezó

  try {
    // Intenta conectar usando la URI
    await mongoose.connect(mongoURI);

    // Si la línea anterior tiene éxito, se ejecuta esta:
    console.log('*********************************');
    console.log('***   MongoDB Conectado...    ***');
    console.log('*********************************');

  } catch (err) {
    // Si la conexión falla, se ejecuta esto:
    console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    console.error('!!! ERROR AL CONECTAR CON MONGODB !!!');
    console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    console.error('Detalles del error:', err.message); // Muestra el mensaje de error específico
    
    // Sugerencias comunes para solucionar el problema
    console.log('\nPosibles soluciones:');
    console.log('1. Verifica que tu IP esté en la lista de acceso de red (IP Access List) en MongoDB Atlas (prueba con 0.0.0.0/0).');
    console.log('2. Asegúrate de que el usuario y la contraseña en tu MONGO_URI sean correctos.');
    console.log('3. Revisa que no haya caracteres especiales sin codificar en tu contraseña.');

    process.exit(1); // Detiene la aplicación si la conexión falla
  }
};

module.exports = connectDB;