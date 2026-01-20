const AuditLog = require('../models/auditLogs.model');

class AuditLogService {
  /**
   * Enregistrer une entrée d'audit
   * @param {Object} data
   */
  async log(data) {
    try {
      const logEntry = new AuditLog({
        user_id: data.user_id,
        action: data.action,
        entity_type: data.entity_type,
        entity_id: data.entity_id,
        old_values: data.old_values || {},
        new_values: data.new_values || {},
        ip_address: data.ip_address,
        user_agent: data.user_agent
      });

      // On ne fait pas await ici pour ne pas bloquer l'opération principale
      logEntry.save().catch(err => {
        console.error('Erreur lors de l\'enregistrement du log d\'audit:', err);
      });

      return logEntry;
    } catch (err) {
      console.error('Erreur création log audit:', err);
      // On ne throw pas → l'audit ne doit pas bloquer l'action
    }
  }

  /**
   * Récupérer les logs (réservé aux admins)
   */
  async getAuditLogs({
    userId,
    entityType,
    entityId,
    action,
    startDate,
    endDate,
    page = 1,
    limit = 50
  }) {
    const query = {};

    if (userId) query.user_id = userId;
    if (entityType) query.entity_type = entityType;
    if (entityId) query.entity_id = entityId;
    if (action) query.action = action;

    if (startDate || endDate) {
      query.created_at = {};
      if (startDate) query.created_at.$gte = new Date(startDate);
      if (endDate) query.created_at.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const logs = await AuditLog.find(query)
      .populate('user_id', 'email role')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);

    const total = await AuditLog.countDocuments(query);

    return {
      logs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Utilitaire rapide pour logger un changement d'entité
   * (à appeler depuis les services quand on fait update/create/delete)
   */
  async logEntityChange({
    userId,
    action,
    entityType,
    entityId,
    oldData,
    newData,
    req // pour récupérer ip et user-agent si disponible
  }) {
    const ip = req?.ip || req?.connection?.remoteAddress || 'unknown';
    const ua = req?.headers?.['user-agent'] || 'unknown';

    return this.log({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      old_values: oldData || {},
      new_values: newData || {},
      ip_address: ip,
      user_agent: ua
    });
  }
}

module.exports = new AuditLogService();