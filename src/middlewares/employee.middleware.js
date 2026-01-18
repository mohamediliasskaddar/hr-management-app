const Employee = require('../models/employees.model');
const { AppError } = require('../utils/appError');

exports.attachEmployeeToUser = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ user_id: req.user._id });
    if (!employee) {
      return next(new AppError('Profil employé non trouvé pour cet utilisateur', 404));
    }
    req.employee = employee;
    next();
  } catch (err) {
    next(err);
  }
};