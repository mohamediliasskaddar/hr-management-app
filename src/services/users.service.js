const User = require('../models/users.model');
const AuditLogService = require('./auditLogs.service');
const { AppError } = require('../utils/appError'); // suppose que tu as ce helper

class UsersService {
  /**
   * Récupère tous les utilisateurs (avec filtres légers)
   */
  async getAllUsers({ role, isActive, search, page = 1, limit = 20 }) {
    const query = {};

    if (role) query.role = role;
    if (isActive !== undefined) query.is_active = isActive;
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .select('-password -password_reset_token -password_reset_expiry')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Récupère un utilisateur par ID
   */
  async getUserById(id) {
    const user = await User.findById(id).select('-password -password_reset_token -password_reset_expiry');
    
    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    return user;
  }

  /**
   * Met à jour un utilisateur (email, role, statut actif/inactif, etc.)
   * Attention : ne permet pas de changer le mot de passe ici
   */
  async updateUser(id, data, currentUserId) {
    const allowedFields = ['email', 'role', 'is_active'];
    const updateData = {};
    const oldData = {};

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      throw new AppError('Aucun champ valide à mettre à jour', 400);
    }

    const user = await User.findById(id);
    if (!user) throw new AppError('Utilisateur non trouvé', 404);

    // Capturer les anciennes valeurs
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        oldData[field] = user[field];
      }
    });

    const updated = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -password_reset_token -password_reset_expiry');

    // Enregistrer l'audit
    await AuditLogService.log({
      user_id: currentUserId,
      action: `L'utilisateur a modifié le compte ${user.email}`,
      entity_type: 'User',
      entity_id: user._id,
      old_values: oldData,
      new_values: updateData
    });

    return updated;
  }

  /**
   * Désactive / Active un compte utilisateur
   */
  async toggleUserStatus(id, isActive) {
    const user = await User.findByIdAndUpdate(
      id,
      { is_active: isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    return user;
  }

  /**
   * Suppression d'un utilisateur (soft ou hard selon ton besoin)
   * Ici version soft (juste désactivation + flag)
   */
  async deleteUser(id) {
    const user = await User.findByIdAndUpdate(
      id,
      { is_active: false },
      { new: true }
    );

    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    return { message: 'Utilisateur désactivé avec succès' };
  }
}

module.exports = new UsersService();