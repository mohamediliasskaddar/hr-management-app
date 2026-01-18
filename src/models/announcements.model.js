const mongoose = require('mongoose');

const announcementScopeEnum = ['ALL_EMPLOYEES', 'SPECIFIC_TEAM'];
const priorityEnum = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];

const announcementsSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  author_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  target_scope: { type: String, enum: announcementScopeEnum, required: true },
  target_team_manager_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  priority: { type: String, enum: priorityEnum, default: 'NORMAL' },
  is_active: { type: Boolean, default: true },
  published_at: { type: Date, default: Date.now },
  expires_at: Date
}, { timestamps: true });

announcementsSchema.index({ is_active: 1, published_at: -1 });
announcementsSchema.index({ priority: 1, published_at: -1 });

module.exports = mongoose.model('Announcement', announcementsSchema);