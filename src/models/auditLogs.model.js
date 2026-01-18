const mongoose = require('mongoose');

const auditLogsSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  action: { type: String, required: true },
  entity_type: { type: String, required: true },
  entity_id: mongoose.Schema.Types.ObjectId,
  old_values: mongoose.Schema.Types.Mixed,
  new_values: mongoose.Schema.Types.Mixed,
  ip_address: String,
  user_agent: String
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false }
});

auditLogsSchema.index({ created_at: -1 });
auditLogsSchema.index({ user_id: 1, created_at: -1 });
auditLogsSchema.index({ entity_type: 1, entity_id: 1 });

module.exports = mongoose.model('AuditLogs', auditLogsSchema);
