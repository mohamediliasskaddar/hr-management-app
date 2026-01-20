

const express = require('express');
const router = express.Router();
const auditLogsController = require('../controllers/auditLogs.controller');
const { protect } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/auth.middleware');

// All audit routes require authentication and ADMIN_RH role
router.use(protect);
router.use(restrictTo('ADMIN_RH'));

/**
 * @swagger
 * /api/audit-logs:
 *   get:
 *     summary: Get all audit logs (Admin only)
 *     tags: [Audit Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *         description: Filter by user who performed the action
 *       - in: query
 *         name: entity_type
 *         schema:
 *           type: string
 *         description: Filter by entity type (Employee, LeaveRequest, User, etc.)
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filter by action (CREATE, UPDATE, DELETE, etc.)
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 50
 *     responses:
 *       200:
 *         description: List of audit logs
 */
router.get('/', auditLogsController.getAuditLogs);

module.exports = router;