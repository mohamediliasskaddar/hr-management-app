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


// const mongoose = require('mongoose');

// const auditLogSchema = new mongoose.Schema({
//   user_id: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     index: true
//   },

//   action: {
//     type: String,
//     required: true,
//     // Exemples possibles : 'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'LOGIN', etc.
//   },

//   entity_type: {
//     type: String,
//     required: true
//     // Exemples : 'Employee', 'LeaveRequest', 'Absence', 'User', 'Announcement', etc.
//   },

//   entity_id: {
//     type: mongoose.Schema.Types.ObjectId,
//     // Pas de ref spécifique car entity_type peut varier
//   },

//   old_values: {
//     type: mongoose.Schema.Types.Mixed,
//     default: {}
//   },

//   new_values: {
//     type: mongoose.Schema.Types.Mixed,
//     default: {}
//   },

//   ip_address: String,

//   user_agent: String

// }, {
//   timestamps: { createdAt: 'created_at', updatedAt: false }
// });

// // Index pour recherches fréquentes
// auditLogSchema.index({ created_at: -1 });
// auditLogSchema.index({ user_id: 1, created_at: -1 });
// auditLogSchema.index({ entity_type: 1, entity_id: 1, created_at: -1 });

// module.exports = mongoose.model('AuditLog', auditLogSchema);
