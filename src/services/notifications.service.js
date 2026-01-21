const Notification = require('../models/notifications.model');
const User = require('../models/users.model');

class NotificationService {
  /**
   * Map des types de notifications et leur configuration d'envoi
   */
  notificationConfig = {
    'ACCOUNT_CREATED': { shouldEmailSend: true, subject: 'Compte créé' },
    'ACCOUNT_ACTIVATED': { shouldEmailSend: true, subject: 'Compte activé' },
    'ACCOUNT_DEACTIVATED': { shouldEmailSend: true, subject: 'Compte désactivé' },
    'LEAVE_REQUEST': { shouldEmailSend: true, subject: 'Nouvelle demande de congé' },
    'LEAVE_APPROVED': { shouldEmailSend: true, subject: 'Congé approuvé' },
    'LEAVE_REJECTED': { shouldEmailSend: true, subject: 'Congé refusé' },
    'JUSTIFICATION_SUBMITTED': { shouldEmailSend: true, subject: 'Justification soumise' },
    'JUSTIFICATION_APPROVED': { shouldEmailSend: true, subject: 'Justification approuvée' },
    'JUSTIFICATION_REJECTED': { shouldEmailSend: true, subject: 'Justification refusée' },
    'ANNOUNCEMENT': { shouldEmailSend: false, subject: 'Annonce' },
    'SYSTEM': { shouldEmailSend: false, subject: 'Notification système' }
  };

  /**
   * Crée une notification et l'envoie automatiquement selon le type
   * @param {Object} data
   * @param {String} data.type          
   * @param {ObjectId} data.recipient_id
   * @param {String} data.title
   * @param {String} data.message
   * @param {String} [data.reference_type]
   * @param {ObjectId} [data.reference_id]
   */
  async createNotification({
    type,
    recipient_id,
    title,
    message,
    reference_type = null,
    reference_id = null
  }) {
    try {
      const notification = new Notification({
        type,
        recipient_id,
        title,
        message,
        reference_type,
        reference_id
      });

      await notification.save();

      // Envoyer automatiquement selon le type
      await this.sendNotificationAutomatically(notification);

      return notification;
    } catch (err) {
      console.error('Erreur création notification:', err);
    }
  }

  /**
   * Envoyer la notification automatiquement selon le type
   */
  async sendNotificationAutomatically(notification) {
    try {
      const config = this.notificationConfig[notification.type];
      
      if (!config) {
        console.warn(`Type de notification inconnu: ${notification.type}`);
        return;
      }

      if (config.shouldEmailSend) {
        await this.sendEmailNotification(notification, config);
      }
    } catch (err) {
      console.error('Erreur lors de l\'envoi automatique de notification:', err);
    }
  }

  /**
   * Envoyer une notification par email
   * (Simulation console - à remplacer par Nodemailer, SendGrid, etc.)
   */
  async sendEmailNotification(notification, config) {
    try {
      const recipient = await User.findById(notification.recipient_id);
      
      if (!recipient || !recipient.email) {
        console.error('Utilisateur ou email non trouvé');
        return;
      }

      // Simulation d'envoi d'email (à remplacer par un vrai service d'email)
      console.log(`
        ╔════════════════════════════════════════════════════════╗
        ║ 📧 EMAIL DE NOTIFICATION ENVOYÉ                        ║
        ╠════════════════════════════════════════════════════════╣
        ║ To: ${recipient.email.padEnd(50)} ║
        ║ Subject: ${config.subject.padEnd(43)} ║
        ║ Type: ${notification.type.padEnd(48)} ║
        ╠════════════════════════════════════════════════════════╣
        ║ ${notification.title.substring(0, 54).padEnd(54)} ║
        ║ ${notification.message.substring(0, 54).padEnd(54)} ║
        ╚════════════════════════════════════════════════════════╝
      `);

      // Marquer comme envoyé
      notification.is_email_sent = true;
      notification.email_sent_at = new Date();
      await notification.save({ validateBeforeSave: false });

    } catch (err) {
      console.error('Erreur lors de l\'envoi d\'email:', err);
    }
  }

  /**
   * Exemple : Marquer comme lue
   */
  async markAsRead(notificationId, userId) {
    return Notification.findOneAndUpdate(
      { _id: notificationId, recipient_id: userId },
      { is_read: true, read_at: new Date() },
      { new: true }
    );
  }

  /**
   * Récupérer les notifications non lues d'un utilisateur
   */
  async getUnreadForUser(userId, limit = 20) {
    return Notification.find({
      recipient_id: userId,
      is_read: false
    })
      .sort({ created_at: -1 })
      .limit(limit);
  }

  /**
   * Récupérer les notifications d'un utilisateur avec pagination
   */
  async getNotificationsForUser(userId, { page = 1, limit = 20, isRead } = {}) {
    const query = { recipient_id: userId };
    
    if (isRead !== undefined) {
      query.is_read = isRead;
    }

    const skip = (page - 1) * limit;

    const notifications = await Notification.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments(query);

    return {
      notifications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Marquer toutes les notifications comme lues
   */
  async markAllAsRead(userId) {
    return Notification.updateMany(
      { recipient_id: userId, is_read: false },
      { is_read: true, read_at: new Date() }
    );
  }
}

module.exports = new NotificationService();