const catchAsync = require('../utils/catchAsync');
const AuthService = require('../services/auth.service');

exports.register = catchAsync(async (req, res) => {
  const { email, password, role } = req.body;

  // Attention : normalement seul ADMIN_RH peut créer des comptes
  // Ici on laisse ouvert pour le développement → à sécuriser après !

  const user = await AuthService.register({
    email,
    password,
    role,
    created_by: req.user?.id // si déjà connecté
  });

  res.status(201).json({
    status: 'success',
    data: {
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    }
  });
});

exports.login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const { token, user } = await AuthService.login(email, password);

  res.status(200).json({
    status: 'success',
    token,
    user
  });
});

exports.forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  const result = await AuthService.forgotPassword(email);
  res.status(200).json(result);
});

exports.resetPassword = catchAsync(async (req, res) => {
  const { token, password } = req.body;
  const result = await AuthService.resetPassword(token, password);
  res.status(200).json(result);
});

exports.changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const result = await AuthService.changePassword(req.user.id, currentPassword, newPassword);
  res.status(200).json(result);
});