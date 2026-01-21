const catchAsync = require('../utils/catchAsync');
const UsersService = require('../services/users.service');

exports.getAllUsers = catchAsync(async (req, res) => {
  const { role, isActive, search, page, limit } = req.query;

  const result = await UsersService.getAllUsers({
    role,
    isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    search,
    page: Number(page) || 1,
    limit: Number(limit) || 20
  });

  res.status(200).json({
    status: 'success',
    data: result
  });
});

exports.getUser = catchAsync(async (req, res) => {
  const user = await UsersService.getUserById(req.params.id);
  
  res.status(200).json({
    status: 'success',
    data: { user }
  });
});

exports.updateUser = catchAsync(async (req, res) => {
  const user = await UsersService.updateUser(req.params.id, req.body, req.user._id);

  res.status(200).json({
    status: 'success',
    data: { user }
  });
});

exports.toggleUserStatus = catchAsync(async (req, res) => {
  const { isActive } = req.body;

  if (typeof isActive !== 'boolean') {
    return res.status(400).json({ status: 'error', message: 'isActive doit être un boolean' });
  }

  const user = await UsersService.toggleUserStatus(req.params.id, isActive);

  res.status(200).json({
    status: 'success',
    data: { user }
  });
});

exports.deleteUser = catchAsync(async (req, res) => {
  const result = await UsersService.deleteUser(req.params.id);
  
  res.status(200).json({
    status: 'success',
    ...result
  });
});