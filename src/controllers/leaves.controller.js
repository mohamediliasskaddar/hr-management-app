const catchAsync = require('../utils/catchAsync');
const LeavesService = require('../services/leaves.service');

exports.createLeaveRequest = catchAsync(async (req, res) => {
  const leave = await LeavesService.createLeaveRequest(
    req.employee._id,
    req.body
  );

  res.status(201).json({
    status: 'success',
    data: { leave }
  });
});


exports.getAllLeaveRequests = catchAsync(async (req, res) => {
  const filters = {
    ...req.query,
    currentUser: req.user
  };

  if (req.user.role === 'EMPLOYEE') {
    filters.currentEmployeeId = req.employee._id;
  }

  const result = await LeavesService.getAllLeaveRequests(filters);

  res.status(200).json({
    status: 'success',
    data: result
  });
});


exports.processLeaveRequest = catchAsync(async (req, res) => {
  const leave = await LeavesService.processLeaveRequest(
    req.params.id,
    req.user._id,
    req.body
  );

  res.status(200).json({
    status: 'success',
    data: { leave }
  });
});

exports.getMyLeaveRequests = catchAsync(async (req, res) => {
  const result = await LeavesService.getLeaveRequests({
    employeeId: req.employee._id,
    ...req.query,
    user: req.user
  });

  res.status(200).json({
    status: 'success',
    data: result
  });
});

exports.getLeaveRequest = catchAsync(async (req, res) => {
  const leave = await LeavesService.getLeaveRequestById(req.params.id, req.user, req.employee);

  res.status(200).json({
    status: 'success',
    data: { leave }
  });
});