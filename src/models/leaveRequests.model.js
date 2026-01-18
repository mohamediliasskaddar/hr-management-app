const mongoose = require('mongoose');

const leaveTypeEnum = ['ANNUEL', 'MALADIE', 'MATERNITE', 'PATERNITE', 'SANS_SOLDE', 'AUTRE'];
const leaveRequestStatusEnum = ['EN_ATTENTE', 'APPROUVE', 'REFUSE'];

const leaveRequestsSchema = new mongoose.Schema({
  employee_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  leave_type: { type: String, enum: leaveTypeEnum, required: true },
  reason: { type: String, required: true, trim: true },
  status: { type: String, enum: leaveRequestStatusEnum, default: 'EN_ATTENTE' },
  days_requested: { type: Number, required: true, min: 0.5 },
  processed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  processed_at: Date,
  rejection_reason: String
}, { timestamps: true });

leaveRequestsSchema.index({ employee_id: 1, start_date: 1 });
leaveRequestsSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('LeaveRequest', leaveRequestsSchema);