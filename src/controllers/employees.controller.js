const catchAsync = require('../utils/catchAsync');
const EmployeesService = require('../services/employees.service');

exports.createEmployee = catchAsync(async (req, res) => {
  const employee = await EmployeesService.createEmployee(req.body, req.user.id);

  res.status(201).json({
    status: 'success',
    data: { employee }
  });
});

exports.getAllEmployees = catchAsync(async (req, res) => {
  const result = await EmployeesService.getAllEmployees(req.query);

  res.status(200).json({
    status: 'success',
    data: result
  });
});

exports.getEmployee = catchAsync(async (req, res) => {
  const employee = await EmployeesService.getEmployeeById(req.params.id);

  res.status(200).json({
    status: 'success',
    data: { employee }
  });
});

exports.updateEmployee = catchAsync(async (req, res) => {
  const employee = await EmployeesService.updateEmployee(req.params.id, req.body);

  res.status(200).json({
    status: 'success',
    data: { employee }
  });
});

exports.deleteEmployee = catchAsync(async (req, res) => {
  const result = await EmployeesService.deleteEmployee(req.params.id);

  res.status(200).json({
    status: 'success',
    message: result.message
  });
});

// Bonus : Voir son équipe (pour MANAGER)
exports.getMyTeam = catchAsync(async (req, res) => {
  // req.user est lié à un employé ? On suppose qu'on a un middleware qui ajoute req.employee
  // Sinon on peut chercher par user_id
  const employee = await Employee.findOne({ user_id: req.user._id });
  if (!employee) throw new AppError('Profil employé non trouvé', 404);

  const team = await EmployeesService.getTeam(employee._id);

  res.status(200).json({
    status: 'success',
    data: { team }
  });
});