const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/users.model');
const { AppError } = require('../utils/appError'); // À créer ou utiliser ton propre système d'erreur

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const RESET_TOKEN_EXPIRY = 60 * 60 * 1000; // 1 heure

class AuthService {
  async register({ email, password, role, created_by }) {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new AppError('Cet email est déjà utilisé', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      created_by: created_by || null,
      is_first_login: true
    });

    return user;
  }

  async login(email, password) {
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      throw new AppError('Email ou mot de passe incorrect', 401);
    }

    if (!user.is_active) {
      throw new AppError('Compte désactivé. Contactez l\'administrateur', 403);
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      throw new AppError('Email ou mot de passe incorrect', 401);
    }

    // Mise à jour dernière connexion
    user.last_login = new Date();
    await user.save({ validateBeforeSave: false });

    const token = this.generateToken(user._id);

    return {
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        is_first_login: user.is_first_login
      }
    };
  }

  generateToken(userId) {
    return jwt.sign({ id: userId }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });
  }

  async forgotPassword(email) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // On ne révèle pas si l'email existe → sécurité
      return { message: 'Si cet email existe, vous recevrez un lien de réinitialisation' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.password_reset_token = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.password_reset_expiry = Date.now() + RESET_TOKEN_EXPIRY;
    await user.save({ validateBeforeSave: false });

    // TODO: Envoyer l'email avec le token
    // Exemple d'URL : `${process.env.FRONTEND_URL}/reset-password/${resetToken}`
    console.log(`Reset token pour ${email} : ${resetToken}`);

    return { message: 'Lien de réinitialisation envoyé (simulation console)' };
  }

  async resetPassword(token, newPassword) {
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      password_reset_token: hashedToken,
      password_reset_expiry: { $gt: Date.now() }
    });

    if (!user) {
      throw new AppError('Token invalide ou expiré', 400);
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.password_reset_token = undefined;
    user.password_reset_expiry = undefined;
    user.is_first_login = false;

    await user.save();

    return { message: 'Mot de passe réinitialisé avec succès' };
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');
    if (!user) throw new AppError('Utilisateur non trouvé', 404);

    const isCorrect = await bcrypt.compare(currentPassword, user.password);
    if (!isCorrect) throw new AppError('Mot de passe actuel incorrect', 400);

    user.password = await bcrypt.hash(newPassword, 12);
    user.is_first_login = false;
    await user.save();

    return { message: 'Mot de passe modifié avec succès' };
  }
}

module.exports = new AuthService();