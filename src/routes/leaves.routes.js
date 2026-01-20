const express = require('express');
const router = express.Router();
const leavesController = require('../controllers/leaves.controller');
const { protect } = require('../middlewares/auth.middleware');
const { attachEmployeeToUser } = require('../middlewares/employee.middleware');
const { restrictTo } = require('../middlewares/auth.middleware');

router.use(protect);
router.use(attachEmployeeToUser);

/**
 * @swagger
 * /api/leaves:
 *   post:
 *     summary: Create a leave request
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [start_date, end_date, leave_type, reason, days_requested]
 *             properties:
 *               start_date:
 *                 type: string
 *                 format: date
 *                 example: 2026-02-01
 *               end_date:
 *                 type: string
 *                 format: date
 *                 example: 2026-02-10
 *               leave_type:
 *                 type: string
 *                 enum: [ANNUEL, MALADIE, MATERNITE, PATERNITE, SANS_SOLDE, AUTRE]
 *                 example: ANNUEL
 *               reason:
 *                 type: string
 *                 example: Family vacation
 *               days_requested:
 *                 type: number
 *                 minimum: 0.5
 *                 example: 10
 *     responses:
 *       201:
 *         description: Leave request created successfully
 */
router.post('/', leavesController.createLeaveRequest);

/**
 * @swagger
 * /api/leaves/my-requests:
 *   get:
 *     summary: Get current employee's leave requests
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [EN_ATTENTE, APPROUVE, REFUSE]
 *       - in: query
 *         name: leave_type
 *         schema:
 *           type: string
 *           enum: [ANNUEL, MALADIE, MATERNITE, PATERNITE, SANS_SOLDE, AUTRE]
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 20
 *     responses:
 *       200:
 *         description: List of employee's leave requests
 */
router.get('/my-requests', leavesController.getMyLeaveRequests);

/**
 * @swagger
 * /api/leaves/{id}/process:
 *   patch:
 *     summary: Process/Approve/Reject a leave request (Manager/Admin only)
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [APPROUVE, REFUSE]
 *                 example: APPROUVE
 *               rejection_reason:
 *                 type: string
 *                 example: Insufficient coverage
 *     responses:
 *       200:
 *         description: Leave request processed successfully
 */
router.patch(
  '/:id/process',
  restrictTo('MANAGER', 'ADMIN_RH'),
  leavesController.processLeaveRequest
);

/**
 * @swagger
 * /api/leaves/{id}:
 *   get:
 *     summary: Get a specific leave request details
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Leave request details
 *       404:
 *         description: Leave request not found
 */
router.get('/:id', leavesController.getLeaveRequest);

module.exports = router;