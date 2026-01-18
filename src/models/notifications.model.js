const mongoose = require('mongoose');

const notificationTypeEnum = [
  'ACCOUNT_CREATED',
  'ACCOUNT_ACTIVATED',
  'ACCOUNT_DEACTIVATED',
  'PASSWORD_RESET',
  'LEAVE_REQUEST',
  'LEAVE_APPROVED',
  'LEAVE_REJECTED',
  'JUSTIFICATION_SUBMITTED',
  'JUSTIFICATION_APPROVED',
  'JUSTIFICATION_REJECTED',
  'ANNOUNCEMENT',
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