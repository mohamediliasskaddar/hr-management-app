const mongoose = require('mongoose');

const notificationTypeEnum = [
  'ACCOUNT_CREATED',//pour la gestion des comptes utilisateurs
  'ACCOUNT_ACTIVATED',//pour la gestion des comptes utilisateurs
  'ACCOUNT_DEACTIVATED',//pour la gestion des comptes utilisateurs
  'LEAVE_REQUEST',//pour les demandes de congé
  'LEAVE_APPROVED',//pour les demandes de congé
  'LEAVE_REJECTED',//pour les demandes de congé
  'JUSTIFICATION_SUBMITTED',//pour les justifications d'absence
  'JUSTIFICATION_APPROVED',//pour les justifications d'absence
  'JUSTIFICATION_REJECTED',//pour les justifications d'absence
  'ANNOUNCEMENT',//pour les annonces générales
  'SYSTEM'
];

const notificationsSchema = new mongoose.Schema({
  recipient_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  type: {
    type: String,
    enum: notificationTypeEnum,
    required: true
  },

  title: {
    type: String,
    required: true,
    trim: true
  },

  message: {
    type: String,
    required: true
  },

  is_read: {
    type: Boolean,
    default: false
  },

  is_email_sent: {
    type: Boolean,
    default: false
  },

  email_sent_at: Date,

  // Pour faire le lien avec l'entité concernée (congé, absence, annonce...)
  reference_type: {
    type: String,
    enum: ['LeaveRequest', 'Absence', 'Announcement', 'User', 'Employee', null],
    default: null
  },

  reference_id: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'reference_type',
    default: null
  },

  read_at: Date

}, {
  timestamps: { createdAt: 'created_at', updatedAt: false }
});

// Index composé très utile pour récupérer rapidement les notifications d'un user
notificationsSchema.index({ recipient_id: 1, created_at: -1 });
notificationsSchema.index({ recipient_id: 1, is_read: 1 });

module.exports = mongoose.model('Notification', notificationsSchema);