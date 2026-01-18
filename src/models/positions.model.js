const mongoose = require('mongoose');

const positionsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  hierarchy_level: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  description: String,
  is_active: {
    type: Boolean,
    default: true
  }

}, {
  timestamps: true
});

positionsSchema.index({ title: 1, department: 1 });

module.exports = mongoose.model('Position', positionsSchema);