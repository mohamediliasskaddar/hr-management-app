const mongoose = require('mongoose');

const userRoleEnum = ['ADMIN_RH', 'MANAGER', 'EMPLOYEE'];

const usersSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: userRoleEnum,
    required: true
  },
  is_active: {
    type: Boolean,
    default: true
  },
  is_first_login: {
    type: Boolean,
    default: true
  },
  password_reset_token: String,
  password_reset_expiry: Date,

  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  last_login: Date,

}, {
  timestamps: true
});

// Index pour recherche rapide sur email
// usersSchema.index({ email: 1 });

module.exports = mongoose.model('User', usersSchema);
