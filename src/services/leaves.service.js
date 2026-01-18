const LeaveRequest = require('../models/leaveRequests.model');
const Employee = require('../models/employees.model');
const NotificationService = require('./notifications.service');
const { AppError } = require('../utils/appError');

class LeavesService {
  /**
   * Créer une nouvelle demande de congé
   */
  async createLeaveRequest(employeeId, data) {
    const employee = await Employee.findById(employeeId);
    if (!employee) throw new AppError('Employé non trouvé', 404);

    const {
      start_date,
      end_date,
      leave_type,
      reason,
      days_requested
    } = data;

    // Validation de base
    if (new Date(start_date) > new Date(end_date)) {
      throw new AppError('La date de début doit être antérieure à la date de fin', 400);
    }

    // Vérification chevauchement (optionnel mais très recommandé)
    const overlapping = await LeaveRequest.findOne({
      employee_id: employeeId,
      status: { $in: ['EN_ATTENTE', 'APPROUVE'] },
      $or: [
        {
          start_date: { $lte: new Date(end_date) },
          end_date: { $gte: new Date(start_date) }
        }
      ]
    });

    if (overlapping) {
      throw new AppError('Il existe déjà une demande de congé qui chevauche ces dates', 400);
    }

    const leave = await LeaveRequest.create({
      employee_id: employeeId,
      start_date: new Date(start_date),
      end_date: new Date(end_date),
      leave_type,
      reason,
      days_requested,
      status: 'EN_ATTENTE'
    });

    // Notifier le manager si existe
    if (employee.manager_id) {
      const manager = await Employee.findById(employee.manager_id).populate('user_id');
      if (manager?.user_id) {
        await NotificationService.createNotification({
          type: 'LEAVE_REQUEST',
          recipient_id: manager.user_id._id,
          title: 'Nouvelle demande de congé à traiter',
          message: `${employee.first_name} ${employee.last_name} demande ${days_requested} jour(s) de ${leave_type} du ${start_date} au ${end_date}`,
          reference_type: 'LeaveRequest',
          reference_id: leave._id
        });
      }
    }

    return leave;
  }

  /**
   * Traiter (approuver/refuser) une demande
   */
  async processLeaveRequest(leaveId, userId, { status, rejection_reason }) {
    const leave = await LeaveRequest.findById(leaveId).populate('employee_id');
    if (!leave) throw new AppError('Demande non trouvée', 404);

    if (leave.status !== 'EN_ATTENTE') {
      throw new AppError('Cette demande a déjà été traitée', 400);
    }

    // Vérifier que l'utilisateur est autorisé (manager ou RH)
    const employee = await Employee.findOne({ user_id: userId });
    const isManager = employee && employee._id.toString() === leave.employee_id.manager_id?.toString();
    const isRH = userId.role === 'ADMIN_RH';

    if (!isManager && !isRH) {
      throw new AppError('Vous n\'êtes pas autorisé à traiter cette demande', 403);
    }

    leave.status = status;
    leave.processed_by = userId;
    leave.processed_at = new Date();

    if (status === 'REFUSE') {
      leave.rejection_reason = rejection_reason || 'Aucune raison spécifiée';
    }

    await leave.save();

    // Notifier l'employé du résultat
    await NotificationService.createNotification({
      type: status === 'APPROUVE' ? 'LEAVE_APPROVED' : 'LEAVE_REJECTED',
      recipient_id: leave.employee_id.user_id,
      title: `Votre demande de congé a été ${status === 'APPROUVE' ? 'approuvée' : 'refusée'}`,
      message: status === 'APPROUVE'
        ? `Votre demande de ${leave.days_requested} jour(s) du ${leave.start_date.toLocaleDateString()} au ${leave.end_date.toLocaleDateString()} a été approuvée.`
        : `Votre demande a été refusée. Raison : ${leave.rejection_reason || 'Non spécifiée'}`,
      reference_type: 'LeaveRequest',
      reference_id: leave._id
    });

    return leave;
  }

  /**
   * Liste des demandes selon rôle/filtres
   */
  async getLeaveRequests({ 
    employeeId, 
    status, 
    startDate, 
    endDate, 
    page = 1, 
    limit = 20,
    user // pour filtrer selon rôle
  }) {
    const query = {};

    // Filtrage selon rôle de l'utilisateur connecté
    if (user.role === 'EMPLOYEE') {
      query.employee_id = employeeId;
    } else if (user.role === 'MANAGER') {
      const managedEmployees = await Employee.find({ manager_id: employeeId }).select('_id');
      query.employee_id = { $in: managedEmployees.map(e => e._id) };
    }
    // ADMIN_RH voit tout → pas de restriction

    if (status) query.status = status;
    if (startDate) query.start_date = { $gte: new Date(startDate) };
    if (endDate) {
      if (query.start_date) query.start_date.$lte = new Date(endDate);
      else query.start_date = { $lte: new Date(endDate) };
    }

    const skip = (page - 1) * limit;

    const requests = await LeaveRequest.find(query)
      .populate('employee_id', 'first_name last_name matricule')
      .populate('processed_by', 'email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await LeaveRequest.countDocuments(query);

    return {
      requests,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    };
  }

  async getLeaveRequestById(id, user) {
    const leave = await LeaveRequest.findById(id)
      .populate('employee_id', 'first_name last_name matricule')
      .populate('processed_by', 'email');

    if (!leave) throw new AppError('Demande non trouvée', 404);

    // Vérification accès
    if (user.role === 'EMPLOYEE' && leave.employee_id.toString() !== user.employeeId) {
      throw new AppError('Accès non autorisé', 403);
    }

    return leave;
  }
}

module.exports = new LeavesService();