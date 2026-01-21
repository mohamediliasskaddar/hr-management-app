const Employee = require('../models/employees.model');
const User = require('../models/users.model');
const Position = require('../models/positions.model');
const AuditLogService = require('./auditLogs.service');
const  AppError  = require('../utils/appError'); 
// import {AppError} from '../utils/appError';

class EmployeesService {
  // Créer un employé + lier à un compte User (ou créer le user en même temps)
  async createEmployee(data, createdByUserId) {
    const {
      email,
      password,
      role = 'EMPLOYEE',
      first_name,
      last_name,
      matricule,
      cin,
      hire_date,
      position_id,
      manager_id,
      ...rest
    } = data;

    // Vérifier matricule et CIN uniques
    if (matricule) {
      const existingMat = await Employee.findOne({ matricule: matricule.toUpperCase() });
      if (existingMat) throw new AppError('Ce matricule est déjà utilisé', 400);
    }

    if (cin) {
      const existingCin = await Employee.findOne({ cin: cin.toUpperCase() });
      if (existingCin) throw new AppError('Ce CIN est déjà utilisé', 400);
    }

    // Créer ou récupérer le User associé
    let user;
    if (email && password) {
      user = await User.create({
        email: email.toLowerCase(),
        password, // sera hashé via pre-save hook ou dans auth service
        role,
        created_by: createdByUserId,
        is_first_login: true
      });
    } else if (email) {
      user = await User.findOne({ email: email.toLowerCase() });
      if (!user) throw new AppError('Utilisateur non trouvé avec cet email', 404);
    }

    const employee = await Employee.create({
      user_id: user?._id,
      first_name,
      last_name,
      matricule: matricule.toUpperCase(),
      cin: cin?.toUpperCase(),
      hire_date,
      position_id: position_id || null,
      manager_id: manager_id || null,
      status: 'ACTIF',
      annual_leave_balance: 30,
      ...rest
    });

    // Populate basique pour retour
    return await this.getEmployeeById(employee._id);
  }

  async getAllEmployees({
    status,
    position_id,
    manager_id,
    search,
    page = 1,
    limit = 20
  }) {
    const query = {};

    if (status) query.status = status;
    if (position_id) query.position_id = position_id;
    if (manager_id) query.manager_id = manager_id;
    if (search) {
      query.$or = [
        { first_name: { $regex: search, $options: 'i' } },
        { last_name: { $regex: search, $options: 'i' } },
        { matricule: { $regex: search, $options: 'i' } },
        { cin: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const employees = await Employee.find(query)
      .populate('user_id', 'email role is_active')
      .populate('position_id', 'title department')
      .populate('manager_id', 'first_name last_name')
      .sort({ hire_date: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Employee.countDocuments(query);

    return {
      employees,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getEmployeeById(id) {
    const employee = await Employee.findById(id)
      .populate('user_id', 'email role is_active last_login')
      .populate('position_id', 'title department hierarchy_level')
      .populate('manager_id', 'first_name last_name matricule');

    if (!employee) throw new AppError('Employé non trouvé', 404);

    return employee;
  }

  async updateEmployee(id, data, currentUserId) {
    const allowedFields = [
      'first_name', 'last_name', 'phone', 'address', 'date_of_birth',
      'position_id', 'manager_id', 'status', 'emergency_contact_name',
      'emergency_contact_phone', 'photo_url'
    ];

    const updates = {};
    const oldData = {};

    const employee = await Employee.findById(id);
    if (!employee) throw new AppError('Employé non trouvé', 404);

    // Capturer anciennes valeurs et préparer les mises à jour
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        oldData[field] = employee[field];
        updates[field] = data[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      throw new AppError('Aucun champ à mettre à jour', 400);
    }

    const updated = await Employee.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    )
      .populate('user_id', 'email role')
      .populate('position_id', 'title department')
      .populate('manager_id', 'first_name last_name');

    if (!updated) throw new AppError('Employé non trouvé', 404);

    // Enregistrer l'audit avec message descriptif
    const employeeDisplayName = `${employee.first_name} ${employee.last_name}`;
    let auditMessage = `L'utilisateur a modifié l'employé ${employeeDisplayName}`;

    // Message spécifique si position a changé
    if (updates.position_id) {
      const oldPosition = oldData.position_id ? await Position.findById(oldData.position_id) : null;
      const newPosition = await Position.findById(updates.position_id);
      auditMessage = `L'utilisateur a lié ${employeeDisplayName} à la position "${newPosition?.title || 'N/A'}"`;
    }

    await AuditLogService.log({
      user_id: currentUserId,
      action: auditMessage,
      entity_type: 'Employee',
      entity_id: employee._id,
      old_values: oldData,
      new_values: updates
    });

    return updated;
  }

  async deleteEmployee(id) {
    const employee = await Employee.findById(id).populate('user_id');
    if (!employee) throw new AppError('Employé non trouvé', 404);

    // Option 1 : Soft delete (recommandé)
    employee.status = 'QUITTE';
    await employee.save();

    // Option 2 : Désactiver le compte user aussi
    if (employee.user_id) {
      await User.findByIdAndUpdate(employee.user_id._id, { is_active: false });
    }

    return { message: 'Employé marqué comme quitté et compte désactivé' };
  }

  // Bonus : Récupérer les subordonnés d'un manager
  async getTeam(managerId) {
    return await Employee.find({ manager_id: managerId })
      .populate('user_id', 'email')
      .populate('position_id', 'title');
  }
}

module.exports = new EmployeesService();