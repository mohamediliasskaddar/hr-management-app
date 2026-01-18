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
  const leave = await LeavesService.getLeaveRequestById(req.params.id, req.user);

  res.status(200).json({
    status: 'success',
    data: { leave }
  });
});