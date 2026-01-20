const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'API Gestion RH - KADDAR',
      version: '1.0.0',
      description:
        'API REST pour la gestion des ressources humaines : employés, congés, absences, pointages, annonces, notifications, audit, authentification...\n\n' +
        'Développé pour une entreprise marocaine (2025-2026 standards)',
      license: {
        name: 'Propriétaire - Usage interne uniquement',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Serveur de développement local',
      },
      {
        url: 'https://api-rh-votre-domaine.com',
        description: 'Serveur de production (à venir)',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Bearer token obtenu après login',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      { name: 'Auth', description: 'Authentification et gestion de compte' },
      { name: 'Users', description: 'Gestion des comptes utilisateurs' },
      { name: 'Employees', description: 'Gestion des employés' },
      { name: 'Leaves', description: 'Demandes de congés' },
      { name: 'Absences', description: 'Gestion des absences & justifications' },
      { name: 'Attendances', description: 'Pointage / Présences' },
      { name: 'Announcements', description: 'Annonces internes' },
      { name: 'Notifications', description: 'Notifications in-app' },
      { name: 'Audit Logs', description: 'Historique des actions (admin only)' },
    ],
  },
  // Chemins où scanner les commentaires JSDoc
  apis: [
    './src/routes/*.js',                    // les routes
    './src/controllers/*.js',               // si tu mets des @swagger dans les controllers
    './src/services/*.js',                  // optionnel
    './src/middlewares/*.js',               // optionnel
  ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};