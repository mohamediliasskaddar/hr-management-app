const catchAsync = require('../utils/catchAsync');
const AbsencesService = require('../services/absences.service');
const Employee = require('../models/employees.model');

exports.declareAbsence = catchAsync(async (req, res) => {
  const absence = await AbsencesService.declareAbsence(
    req.body.employee_id,
    req.body,
    req.user._id
  );

  res.status(201).json({
    status: 'success',
    data: { absence }
  });
});

exports.submitJustification = catchAsync(async (req, res) => {
  const absence = await AbsencesService.submitJustification(
    req.params.id,
    req.user._id,
    req.body
  );

  res.status(200).json({
    status: 'success',
    data: { absence }
  });
});

exports.processJustification = catchAsync(async (req, res) => {
  const absence = await AbsencesService.processJustification(
    req.params.id,
    req.user._id,
    req.body
  );

  res.status(200).json({
    status: 'success',
    data: { absence }
  });
});

exports.getAbsences = catchAsync(async (req, res) => {
  const result = await AbsencesService.getAbsences({
    employeeId: req.employee?._id,
    ...req.query,
    currentUser: req.user
  });

  res.status(200).json({
    status: 'success',
    data: result
  });
});

/**
 * Get absences for all employees with justifications (Admin/Manager only)
 * Manager sees only their team, Admin RH sees all
 */
exports.getAllAbsences = catchAsync(async (req, res) => {
  const { employeeId, status, dateStart, dateEnd, page = 1, limit = 20 } = req.query;

  // Get employee profile for manager filtering
  const currentEmployee = await Employee.findOne({ user_id: req.user._id });

  const result = await AbsencesService.getAllAbsencesForManagement({
    employeeId,
    status,
    dateStart,
    dateEnd,
    page: Number(page),
    limit: Number(limit),
    managerId: currentEmployee?._id,
    userRole: req.user.role
  });

  res.status(200).json({
    status: 'success',
    data: result
  });
});