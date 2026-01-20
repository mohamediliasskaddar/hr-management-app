// const mongoose = require('mongoose');
// const dotenv = require('dotenv');

// // Charger les variables d'environnement dès le début
// dotenv.config({ path: '../.env' }); 

// const app = require('./app');

// // Gestion des erreurs non capturées (promesses rejetées, etc.)
// process.on('uncaughtException', err => {
//   console.log('UNCAUGHT EXCEPTION! 💥 Arrêt du serveur...');
//   console.log(err.name, err.message);
//   process.exit(1);
// });

// const DB = process.env.DATABASE 
//   ? process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)
//   : process.env.MONGODB_URI || 'mongodb://localhost:27017/hr-app';

// mongoose
//   .connect(DB)
//   .then(() => {
//     console.log('Base de données MongoDB connectée avec succès !');
//   })
//   .catch(err => {
//     console.error('Erreur de connexion MongoDB :', err.message);
//     // Ne pas arrêter le serveur si la BD échoue (pour le dev)
//   });

// // Démarrage du serveur
// const port = process.env.PORT || 3000;
// const server = app.listen(port, () => {
//   console.log(`Serveur démarré sur le port ${port}...`);
//   console.log(`Environnement : ${process.env.NODE_ENV}`);
//   console.log(`Documentation Swagger disponible sur http://localhost:${port}/api-docs`);
// });

// // Gestion graceful shutdown (SIGTERM, SIGINT)
// process.on('SIGTERM', () => {
//   console.log('SIGTERM reçu. Arrêt gracieux du serveur...');
//   server.close(() => {
//     console.log('Serveur fermé.');
//     mongoose.connection.close(false, () => {
//       console.log('Connexion MongoDB fermée.');
//       process.exit(0);
//     });
//   });
// });

// process.on('unhandledRejection', err => {
//   console.log('UNHANDLED REJECTION! 💥 Arrêt du serveur...');
//   console.log(err.name, err.message);
//   server.close(() => {
//     process.exit(1);
//   });
// });
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const app = require('./app');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hr-app')
  .then(() => console.log('MongoDB connected'));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
