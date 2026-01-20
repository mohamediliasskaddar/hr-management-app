const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./middlewares/error.middleware');

// Import des routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/users.routes');
const employeeRoutes = require('./routes/employees.routes');
const leaveRoutes = require('./routes/leaves.routes');
const absenceRoutes = require('./routes/absences.routes');
const attendanceRoutes = require('./routes/attendances.routes');
const announcementRoutes = require('./routes/announcements.routes');
const notificationRoutes = require('./routes/notifications.routes');
const auditLogRoutes = require('./routes/auditLogs.routes');
const positionsRoutes = require('./routes/positions.routes');

const app = express();

// MIDDLEWARES ESSENTIELS
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger Documentation
const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'HR Management API',
      version: '1.0.0',
      description: 'API documentation for HR Management application',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  })
);

// ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/absences', absenceRoutes);
app.use('/api/attendances', attendanceRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/positions', positionsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is working',
    timestamp: new Date().toISOString()
  });
});


// 404 handler
app.use((req, res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
});

// Global error handler
app.use(globalErrorHandler);

module.exports = app;
