const Attendance = require('../models/attendances.model');
const Employee = require('../models/employees.model');
const { AppError } = require('../utils/appError');

class AttendancesService {
  /**
   * Enregistrer un pointage (check-in ou check-out)
   */
  async recordAttendance(employeeId, data) {
    const { check_in_time, check_out_time, notes } = data;

    const employee = await Employee.findById(employeeId);
    if (!employee) throw new AppError("Employé non trouvé", 404);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Recherche si pointage du jour existe déjà
    let attendance = await Attendance.findOne({
      employee_id: employeeId,
      attendance_date: today
    });

    if (!attendance) {
      // Premier pointage de la journée → check-in
      if (!check_in_time) {
        throw new AppError("Heure d'arrivée requise pour le premier pointage du jour", 400);
      }

      attendance = new Attendance({
        employee_id: employeeId,
        attendance_date: today,
        check_in_time: new Date(check_in_time),
        notes
      });
    } else {
      // Pointage existant → mise à jour check-out ou correction
      if (check_out_time) {
        attendance.check_out_time = new Date(check_out_time);
      }
      if (notes) attendance.notes = notes;

      // Recalcul du statut et total hours
      await this.calculateStatusAndHours(attendance._id);
    }

    await attendance.save();
    return attendance;
  }

  /**
   * Séparer check-in
   */
  async checkIn(employeeId, { check_in_time, notes }) {
    const employee = await Employee.findById(employeeId);
    if (!employee) throw new AppError("Employé non trouvé", 404);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let attendance = await Attendance.findOne({
      employee_id: employeeId,
      attendance_date: today
    });

    if (!attendance) {
      if (!check_in_time) {
        // accept current time if not provided
        check_in_time = new Date();
      }

      attendance = new Attendance({
        employee_id: employeeId,
        attendance_date: today,
        check_in_time: new Date(check_in_time),
        notes
      });
    } else {
      // Update existing record if check_in_time missing
      if (!attendance.check_in_time) {
        attendance.check_in_time = check_in_time ? new Date(check_in_time) : new Date();
      }
      if (notes) attendance.notes = notes;
    }

    await attendance.save();
    return attendance;
  }

  /**
   * Séparer check-out
   */
  async checkOut(employeeId, { check_out_time, notes }) {
    const employee = await Employee.findById(employeeId);
    if (!employee) throw new AppError("Employé non trouvé", 404);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let attendance = await Attendance.findOne({
      employee_id: employeeId,
      attendance_date: today
    });

    if (!attendance) {
      // No check-in yet; create a record with null check_in_time and check_out_time
      attendance = new Attendance({
        employee_id: employeeId,
        attendance_date: today,
        check_out_time: check_out_time ? new Date(check_out_time) : new Date(),
        notes
      });
    } else {
      attendance.check_out_time = check_out_time ? new Date(check_out_time) : new Date();
      if (notes) attendance.notes = notes;
    }

    // Recalculate status and hours
    await this.calculateStatusAndHours(attendance._id);

    await attendance.save();
    return attendance;
  }

  /**
   * Récupérer les pointages d'un employé (avec filtres)
   */
  async getEmployeeAttendances(employeeId, { startDate, endDate, page = 1, limit = 31 }) {
    const query = { employee_id: employeeId };

    if (startDate) query.attendance_date = { $gte: new Date(startDate) };
    if (endDate) {
      if (query.attendance_date) {
        query.attendance_date.$lte = new Date(endDate);
      } else {
        query.attendance_date = { $lte: new Date(endDate) };
      }
    }

    const skip = (page - 1) * limit;

    const attendances = await Attendance.find(query)
      .sort({ attendance_date: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Attendance.countDocuments(query);

    return {
      attendances,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Récupérer le pointage du jour pour un employé
   */
  async getTodayAttendance(employeeId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      employee_id: employeeId,
      attendance_date: today
    });

    return attendance;
  }

  /**
   * Calcul automatique du statut et total_hours (méthode ajoutée au modèle)
   */
  async calculateStatusAndHours(attendanceId) {
    const attendance = await Attendance.findById(attendanceId);
    if (!attendance) return;

    if (!attendance.check_in_time) {
      attendance.status = 'ABSENT';
      attendance.total_hours = 0;
    } else if (!attendance.check_out_time) {
      attendance.status = 'INCOMPLET';
      attendance.total_hours = null; // ou calcul partiel si voulu
    } else {
      const diffMs = attendance.check_out_time - attendance.check_in_time;
      const hours = diffMs / (1000 * 60 * 60);
      attendance.total_hours = Math.round(hours * 100) / 100;

      // Logique simple (à adapter selon règles entreprise)
      if (hours >= 7.5) {
        attendance.status = 'COMPLET';
      } else {
        attendance.status = 'INCOMPLET';
      }
    }

    await attendance.save({ validateBeforeSave: false });
  }

  /**
   * Pour admin / RH : voir les absences / incomplets d'une période
   */
  async getDailySummary({ date }) {
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const attendances = await Attendance.find({
      attendance_date: targetDate
    })
      .populate('employee_id', 'first_name last_name matricule')
      .select('status total_hours check_in_time check_out_time');

    return attendances;
  }

  /**
   * Get attendance list for all employees (Admin/Manager filtering)
   */
  async getAllAttendances({
    employeeId,
    status,
    startDate,
    endDate,
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
    if (status) query.status = status;

    if (startDate) {
      query.attendance_date = { $gte: new Date(startDate) };
    }
    if (endDate) {
      if (query.attendance_date) {
        query.attendance_date.$lte = new Date(endDate);
      } else {
        query.attendance_date = { $lte: new Date(endDate) };
      }
    }

    const skip = (page - 1) * limit;

    const attendances = await Attendance.find(query)
      .populate('employee_id', 'first_name last_name matricule email')
      .populate('employee_id.manager_id', 'first_name last_name')
      .sort({ attendance_date: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Attendance.countDocuments(query);

    return {
      attendances,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
}
module.exports = new AttendancesService();
