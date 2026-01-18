const jwt = require('jsonwebtoken');
const User = require('../models/users.model');
const { AppError } = require('../utils/appError');

exports.protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Vous devez être connecté pour accéder à cette ressource', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-key-change-me');

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError('Utilisateur non trouvé', 401));
    }

    if (!currentUser.is_active) {
      return next(new AppError('Compte désactivé', 403));
    }

    req.user = currentUser;
    next();
  } catch (err) {
    next(new AppError('Session invalide ou expirée', 401));
  }
};


exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('Vous n\'avez pas la permission d\'effectuer cette action', 403)
      );
    }
    next();
  };
};