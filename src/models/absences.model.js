const mongoose = require('mongoose');

const absenceTypeEnum = ['MALADIE', 'PERSONNEL', 'NON_JUSTIFIE', 'AUTRE'];
const justificationStatusEnum = ['NON_FOURNI', 'EN_ATTENTE', 'VALIDE', 'REFUSE'];

const absencesSchema = new mongoose.Schema({
  employee_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
  absence_date: { type: Date, required: true },
  absence_type: { type: String, enum: absenceTypeEnum, required: true },
  reason: String,
  declared_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  justification_status: { type: String, enum: justificationStatusEnum, default: 'NON_FOURNI' },
  justification_file_url: String,
  justification_submitted_at: Date,
  justification_processed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  justification_processed_at: Date,
  justification_rejection_reason: String
}, { timestamps: true });

absencesSchema.index({ employee_id: 1, absence_date: 1 });
absencesSchema.index({ justification_status: 1 });

module.exports = mongoose.model('Absence', absencesSchema);