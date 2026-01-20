const AppError = require('../utils/appError');

const sendErrorDev = (err, res) => {
  res.status(err.statusCode || 500).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  // Erreur opérationnelle → envoyer au client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  }
  // Erreur programmation ou inconnue → ne pas leak d'infos
  else {
    console.error('ERROR 💥', err);
    res.status(500).json({
      status: 'error',
      message: 'Quelque chose a mal tourné... Veuillez réessayer plus tard.'
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    sendErrorProd(err, res);
  }
};