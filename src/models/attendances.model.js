const mongoose = require('mongoose');

const attendancesStatusEnum = ['COMPLET', 'INCOMPLET', 'ABSENT'];

const attendancesSchema = new mongoose.Schema({
  employee_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
  attendance_date: { type: Date, required: true },
  check_in_time: { type: Date, required: true },
  check_out_time: Date,
  total_hours: { type: Number, min: 0 },
  status: { type: String, enum: attendancesStatusEnum, default: 'INCOMPLET' },
  notes: String
}, { timestamps: true });

attendancesSchema.index(
  { employee_id: 1, attendance_date: 1 },
  { unique: true }
);

module.exports = mongoose.model('Attendance', attendancesSchema);
