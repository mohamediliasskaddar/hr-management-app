const Notification = require('../models/notifications.model');

class NotificationService {
  /**
   * Crée une notification et la sauvegarde
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


      return notification;
    } catch (err) {
      console.error('Erreur création notification:', err);
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

  
}

module.exports = new NotificationService();