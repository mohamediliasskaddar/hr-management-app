const catchAsync = require('../utils/catchAsync');
const PositionsService = require('../services/positions.service');

/**
 * Get all positions
 */
exports.getAllPositions = catchAsync(async (req, res) => {
  const { department, is_active, search, page, limit } = req.query;

  const result = await PositionsService.getAllPositions({
    department,
    is_active: is_active === 'true' ? true : is_active === 'false' ? false : undefined,
    search,
    page: Number(page) || 1,
    limit: Number(limit) || 20
  });

  res.status(200).json({
    status: 'success',
    data: result
  });
});

/**
 * Get position by ID
 */
exports.getPosition = catchAsync(async (req, res) => {
  const position = await PositionsService.getPositionById(req.params.id);

  res.status(200).json({
    status: 'success',
    data: { position }
  });
});

/**
 * Create position
 */
exports.createPosition = catchAsync(async (req, res) => {
  const position = await PositionsService.createPosition(req.body);

  res.status(201).json({
    status: 'success',
    data: { position }
  });
});

/**
 * Update position
 */
exports.updatePosition = catchAsync(async (req, res) => {
  const position = await PositionsService.updatePosition(req.params.id, req.body);

  res.status(200).json({
    status: 'success',
    data: { position }
  });
});

/**
 * Delete position
 */
exports.deletePosition = catchAsync(async (req, res) => {
  await PositionsService.deletePosition(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});

/**
 * Toggle position status
 */
exports.togglePositionStatus = catchAsync(async (req, res) => {
  const position = await PositionsService.togglePositionStatus(req.params.id);

  res.status(200).json({
    status: 'success',
    data: { position }
  });
});
