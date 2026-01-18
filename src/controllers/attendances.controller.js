const catchAsync = require('../utils/catchAsync');
const AttendancesService = require('../services/attendances.service');

exports.recordAttendance = catchAsync(async (req, res) => {
  // On suppose que req.employee existe (via middleware)
  const attendance = await AttendancesService.recordAttendance(
    req.employee._id,
    req.body
  );

  res.status(200).json({
    status: 'success',
    data: { attendance }
  });
});

exports.getMyAttendances = catchAsync(async (req, res) => {
  const result = await AttendancesService.getEmployeeAttendances(
    req.employee._id,
    req.query
  );

  res.status(200).json({
    status: 'success',
    data: result
  });
});

exports.getTodayAttendance = catchAsync(async (req, res) => {
  const attendance = await AttendancesService.getTodayAttendance(req.employee._id);

  res.status(200).json({
    status: 'success',
    data: { attendance: attendance || null }
  });
});

// Routes admin / RH
exports.getDailySummary = catchAsync(async (req, res) => {
  const summary = await AttendancesService.getDailySummary(req.query);

  res.status(200).json({
    status: 'success',
    data: { summary }
  });
});