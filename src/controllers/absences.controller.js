

const catchAsync = require('../utils/catchAsync');
const AbsencesService = require('../services/absences.service');

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