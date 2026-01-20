const mongoose = require('mongoose');

const employeeStatusEnum = ['ACTIF', 'SUSPENDU', 'QUITTE'];

const employeesSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  first_name: {
    type: String,
    required: true,
    trim: true
  },
  last_name: {
    type: String,
    required: true,
    trim: true
  },

  phone: String,
  address: String,
  date_of_birth: Date,
  hire_date: {
    type: Date,
    required: true
  },

  status: {
    type: String,
    enum: employeeStatusEnum,
    default: 'ACTIF'
  },

  position_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Position'
  },

  manager_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },

  annual_leave_balance: {
    type: Number,
    default: 30
  },

  matricule: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },

  cin: {
    type: String,
    unique: true,
    uppercase: true,
    trim: true
  },

  social_security_number: String,
  emergency_contact_name: String,
  emergency_contact_phone: String,
  photo_url: String

}, {
  timestamps: true
});

// employeesSchema.index({ matricule: 1 });
// employeesSchema.index({ cin: 1 });

module.exports = mongoose.model('Employee', employeesSchema);
