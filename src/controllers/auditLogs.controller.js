const catchAsync = require('../utils/catchAsync');
const AuditLogService = require('../services/auditLogs.service');

exports.getAuditLogs = catchAsync(async (req, res) => {
  // Réservé aux admins uniquement
  if (req.user.role !== 'ADMIN_RH') {
    return res.status(403).json({
      status: 'error',
      message: 'Accès réservé aux administrateurs RH'
    });
  }

  const result = await AuditLogService.getAuditLogs({
    ...req.query,
    userId: req.query.userId,
    entityType: req.query.entityType,
    entityId: req.query.entityId,
    action: req.query.action
  });

  res.status(200).json({
    status: 'success',
    data: result
  });
});