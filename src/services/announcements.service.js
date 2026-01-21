const Announcement = require('../models/announcements.model');
const Employee = require('../models/employees.model');
const NotificationService = require('./notifications.service');
const  AppError  = require('../utils/appError');

class AnnouncementsService {
  /**
   * Créer une nouvelle annonce + notifier les destinataires
   */
  async createAnnouncement(data, authorId) {
    const {
      title,
      content,
      target_scope,
      target_team_manager_id,
      priority = 'NORMAL',
      expires_at
    } = data;

    if (target_scope === 'SPECIFIC_TEAM' && !target_team_manager_id) {
      throw new AppError('Le manager de l\'équipe doit être spécifié pour un scope "SPECIFIC_TEAM"', 400);
    }

    const announcement = await Announcement.create({
      title,
      content,
      author_id: authorId,
      target_scope,
      target_team_manager_id: target_scope === 'SPECIFIC_TEAM' ? target_team_manager_id : null,
      priority,
      expires_at: expires_at ? new Date(expires_at) : null,
      published_at: new Date(),
      is_active: true
    });

    // Générer les notifications pour les destinataires
    await this.notifyRecipients(announcement);

    return await this.getAnnouncementById(announcement._id);
  }

  /**
   * Notifier automatiquement les employés concernés
   */
  async notifyRecipients(announcement) {
    let recipients = [];

    if (announcement.target_scope === 'ALL_EMPLOYEES') {
      // Tous les utilisateurs actifs
      const users = await Employee.find({ status: 'ACTIF' })
        .populate('user_id')
        .select('user_id');

      recipients = users
        .filter(e => e.user_id)
        .map(e => e.user_id._id);
    } else if (announcement.target_scope === 'SPECIFIC_TEAM') {
      // Équipe d'un manager spécifique
      const teamMembers = await Employee.find({
        manager_id: announcement.target_team_manager_id,
        status: 'ACTIF'
      })
        .populate('user_id')
        .select('user_id');

      recipients = teamMembers
        .filter(e => e.user_id)
        .map(e => e.user_id._id);
    }

    // Créer une notification pour chaque destinataire
    for (const recipientId of recipients) {
      await NotificationService.createNotification({
        type: 'ANNOUNCEMENT',
        recipient_id: recipientId,
        title: announcement.title,
        message: `Nouvelle annonce : ${announcement.content.substring(0, 120)}${announcement.content.length > 120 ? '...' : ''}`,
        reference_type: 'Announcement',
        reference_id: announcement._id
      });
    }
  }

  async getAllAnnouncements({ activeOnly = true, priority, page = 1, limit = 20 }) {
    const query = {};

    if (activeOnly) {
      query.is_active = true;
      query.$or = [
        { expires_at: { $exists: false } },
        { expires_at: { $gt: new Date() } }
      ];
    }

    if (priority) query.priority = priority;

    const skip = (page - 1) * limit;

    const announcements = await Announcement.find(query)
      .populate('author_id', 'email')
      .populate('target_team_manager_id', 'first_name last_name')
      .sort({ published_at: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Announcement.countDocuments(query);

    return {
      announcements,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getAnnouncementById(id) {
    const announcement = await Announcement.findById(id)
      .populate('author_id', 'email')
      .populate('target_team_manager_id', 'first_name last_name');

    if (!announcement) throw new AppError('Annonce non trouvée', 404);

    return announcement;
  }

  async updateAnnouncement(id, data, currentUserId) {
    const announcement = await Announcement.findById(id);
    if (!announcement) throw new AppError('Annonce non trouvée', 404);

    // Seul l'auteur ou un ADMIN_RH peut modifier
    const isAuthor = announcement.author_id.toString() === currentUserId.toString();
    if (!isAuthor && currentUserId.role !== 'ADMIN_RH') {
      throw new AppError('Vous n\'êtes pas autorisé à modifier cette annonce', 403);
    }

    const allowedFields = ['title', 'content', 'priority', 'expires_at', 'is_active'];
    const updates = {};

    allowedFields.forEach(field => {
      if (data[field] !== undefined) updates[field] = data[field];
    });

    if (Object.keys(updates).length === 0) {
      throw new AppError('Aucun champ à mettre à jour', 400);
    }

    Object.assign(announcement, updates);
    await announcement.save();

    return announcement;
  }

  async deleteAnnouncement(id, currentUserId) {
    const announcement = await Announcement.findById(id);
    if (!announcement) throw new AppError('Annonce non trouvée', 404);

    const isAuthor = announcement.author_id.toString() === currentUserId.toString();
    if (!isAuthor && currentUserId.role !== 'ADMIN_RH') {
      throw new AppError('Vous n\'êtes pas autorisé à supprimer cette annonce', 403);
    }

    await Announcement.findByIdAndDelete(id);

    return { message: 'Annonce supprimée avec succès' };
  }
}

module.exports = new AnnouncementsService();