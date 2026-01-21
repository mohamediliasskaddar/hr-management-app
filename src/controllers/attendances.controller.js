const catchAsync = require('../utils/catchAsync');
const AttendancesService = require('../services/attendances.service');
const Employee = require('../models/employees.model');
const { AppError } = require('../utils/appError');

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

exports.checkIn = catchAsync(async (req, res) => {
  const attendance = await AttendancesService.checkIn(req.employee._id, req.body);

  res.status(201).json({
    status: 'success',
    data: { attendance }
  });
});

exports.checkOut = catchAsync(async (req, res) => {
  const attendance = await AttendancesService.checkOut(req.employee._id, req.body);

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

/**
 * Get attendance list for all employees (Admin/Manager only)
 * Manager sees only their team, Admin RH sees all
 */
exports.getAllAttendances = catchAsync(async (req, res) => {
  const { employeeId, status, startDate, endDate, page = 1, limit = 20 } = req.query;

  // Get employee profile for manager filtering
  const currentEmployee = await Employee.findOne({ user_id: req.user._id });
  
  const result = await AttendancesService.getAllAttendances({
    employeeId,
    status,
    startDate,
    endDate,
    page: Number(page),
    limit: Number(limit),
    managerId: currentEmployee?._id, // pass manager ID if manager
    userRole: req.user.role
  });

  res.status(200).json({
    status: 'success',
    data: result
  });
});