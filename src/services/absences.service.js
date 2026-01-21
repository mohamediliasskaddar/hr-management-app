const Absence = require('../models/absences.model');
const Employee = require('../models/employees.model');
const NotificationService = require('./notifications.service');
const AuditLogService = require('./auditLogs.service');
const  AppError  = require('../utils/appError');

class AbsencesService {
  /**
   * Déclarer une absence (généralement par un manager ou RH)
   */
  async declareAbsence(employeeId, data, declaredByUserId) {
    const employee = await Employee.findById(employeeId);
    if (!employee) throw new AppError('Employé non trouvé', 404);

    const { absence_date, absence_type, reason } = data;

    // Normaliser la date au début du jour et créer une borne supérieure
    const absenceDateObj = new Date(absence_date);
    absenceDateObj.setHours(0, 0, 0, 0);
    const nextDay = new Date(absenceDateObj);
    nextDay.setDate(nextDay.getDate() + 1);

    // Vérifier si absence déjà déclarée ce jour-là (recherche par intervalle)
    const existing = await Absence.findOne({
      employee_id: employeeId,
      absence_date: { $gte: absenceDateObj, $lt: nextDay }
    });

    if (existing) {
      throw new AppError('Une absence a déjà été déclarée pour cette date', 400);
    }

    const absence = await Absence.create({
      employee_id: employeeId,
      absence_date: new Date(absence_date),
      absence_type,
      reason,
      declared_by: declaredByUserId,
      justification_status: 'NON_FOURNI'
    });

    // Notifier l'employé concerné
    await NotificationService.createNotification({
      type: 'SYSTEM',
      recipient_id: employee.user_id,
      title: 'Absence déclarée',
      message: `Une absence de type ${absence_type} a été déclarée pour le ${absence.absence_date.toLocaleDateString()}. Veuillez fournir une justification si nécessaire.`,
      reference_type: 'Absence',
      reference_id: absence._id
    });

    return absence;
  }

  /**
   * Soumettre une justification (par l'employé)
   */
  async submitJustification(absenceId, employeeUserId, { justification_file_url, reason }) {
    const absence = await Absence.findById(absenceId).populate('employee_id');
    if (!absence) throw new AppError('Absence non trouvée', 404);

    // Vérifier que c'est bien l'employé concerné
    if (absence.employee_id.user_id.toString() !== employeeUserId.toString()) {
      throw new AppError('Vous n\'êtes pas autorisé à soumettre une justification pour cette absence', 403);
    }

    if (absence.justification_status !== 'NON_FOURNI') {
      throw new AppError('Une justification a déjà été soumise ou traitée', 400);
    }

    absence.justification_file_url = justification_file_url;
    absence.reason = reason || absence.reason;
    absence.justification_status = 'EN_ATTENTE';
    absence.justification_submitted_at = new Date();

    await absence.save();

    // Notifier le manager / RH
    const manager = await Employee.findById(absence.employee_id.manager_id).populate('user_id');
    if (manager?.user_id) {
      await NotificationService.createNotification({
        type: 'JUSTIFICATION_SUBMITTED',
        recipient_id: manager.user_id._id,
        title: 'Justification d\'absence soumise',
        message: `${absence.employee_id.first_name} ${absence.employee_id.last_name} a soumis une justification pour le ${absence.absence_date.toLocaleDateString()}.`,
        reference_type: 'Absence',
        reference_id: absence._id
      });
    }

    return absence;
  }

  /**
   * Traiter une justification (valider/refuser)
   */
  async processJustification(absenceId, processorUserId, { status, rejection_reason }) {
    const absence = await Absence.findById(absenceId).populate('employee_id');
    if (!absence) throw new AppError('Absence non trouvée', 404);

    if (absence.justification_status !== 'EN_ATTENTE') {
      throw new AppError('Cette justification a déjà été traitée', 400);
    }

    const oldStatus = absence.justification_status;
    absence.justification_status = status;
    absence.justification_processed_by = processorUserId;
    absence.justification_processed_at = new Date();

    if (status === 'REFUSE') {
      absence.justification_rejection_reason = rejection_reason || 'Aucune raison spécifiée';
    }

    await absence.save();

    // Enregistrer l'audit
    const auditAction = status === 'VALIDE' 
      ? `L'utilisateur a validé la justification d'absence de ${absence.employee_id.first_name} ${absence.employee_id.last_name}`
      : `L'utilisateur a refusé la justification d'absence de ${absence.employee_id.first_name} ${absence.employee_id.last_name}`;

    await AuditLogService.log({
      user_id: processorUserId,
      action: auditAction,
      entity_type: 'Absence',
      entity_id: absence._id,
      old_values: { justification_status: oldStatus },
      new_values: { justification_status: status, rejection_reason: absence.justification_rejection_reason }
    });

    // Notifier l'employé avec notification automatique
    await NotificationService.createNotification({
      type: status === 'VALIDE' ? 'JUSTIFICATION_APPROVED' : 'JUSTIFICATION_REJECTED',
      recipient_id: absence.employee_id.user_id,
      title: `Votre justification a été ${status === 'VALIDE' ? 'validée' : 'refusée'}`,
      message: status === 'VALIDE'
        ? 'Votre justification a été acceptée.'
        : `Votre justification a été refusée. Raison : ${absence.justification_rejection_reason}`,
      reference_type: 'Absence',
      reference_id: absence._id
    });

    return absence;
  }

  /**
   * Liste des absences (filtrée selon rôle)
   */
  async getAbsences({ employeeId, dateStart, dateEnd, status, page = 1, limit = 20, currentUser }) {
    const query = {};

    // Filtrage selon rôle
    if (currentUser.role === 'EMPLOYEE') {
      query.employee_id = employeeId;
    } else if (currentUser.role === 'MANAGER') {
      const team = await Employee.find({ manager_id: employeeId }).select('_id');
      query.employee_id = { $in: team.map(e => e._id) };
    }
    // ADMIN_RH voit tout

    if (dateStart) query.absence_date = { $gte: new Date(dateStart) };
    if (dateEnd) {
      query.absence_date = query.absence_date || {};
      query.absence_date.$lte = new Date(dateEnd);
    }
    if (status) query.justification_status = status;

    const skip = (page - 1) * limit;

    const absences = await Absence.find(query)
      .populate('employee_id', 'first_name last_name matricule')
      .populate('declared_by', 'email')
      .populate('justification_processed_by', 'email')
      .sort({ absence_date: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Absence.countDocuments(query);

    return {
      absences,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    };
  }

  /**
   * Get all absences with justifications for Admin/Manager management view
   */
  async getAllAbsencesForManagement({
    employeeId,
    status,
    dateStart,
    dateEnd,
    page = 1,
    limit = 20,
    managerId,
    userRole
  }) {
    const query = {};

    // Filter by role
    if (userRole === 'MANAGER') {
      // Manager sees only their team
      const teamMembers = await Employee.find({ manager_id: managerId }).select('_id');
      query.employee_id = { $in: teamMembers.map(e => e._id) };
    }
    // ADMIN_RH sees all → no employee filter

    // Additional filters
    if (employeeId) query.employee_id = employeeId;
    if (status) query.justification_status = status;

    if (dateStart) {
      query.absence_date = { $gte: new Date(dateStart) };
    }
    if (dateEnd) {
      if (query.absence_date) {
        query.absence_date.$lte = new Date(dateEnd);
      } else {
        query.absence_date = { $lte: new Date(dateEnd) };
      }
    }

    const skip = (page - 1) * limit;

    const absences = await Absence.find(query)
      .populate('employee_id', 'first_name last_name matricule email status')
      .populate('employee_id.manager_id', 'first_name last_name')
      .populate('declared_by', 'email')
      .populate('justification_processed_by', 'email')
      .select(
        'employee_id absence_date absence_type reason justification_status ' +
        'justification_file_url justification_submitted_at justification_processed_at ' +
        'justification_rejection_reason declared_by'
      )
      .sort({ absence_date: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Absence.countDocuments(query);

    return {
      absences,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
}

module.exports = new AbsencesService();