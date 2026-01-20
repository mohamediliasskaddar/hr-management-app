const express = require('express');
const router = express.Router();
const attendancesController = require('../controllers/attendances.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');
const { attachEmployeeToUser } = require('../middlewares/employee.middleware');

// All routes require authentication
router.use(protect);
router.use(attachEmployeeToUser);

/**
 * @swagger
 * /api/attendances/record:
 *   post:
 *     summary: Record attendance (check-in/check-out)
 *     tags: [Attendances]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [check_in_time]
 *             properties:
 *               check_in_time:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-01-20T08:00:00Z
 *               check_out_time:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-01-20T17:00:00Z
 *               notes:
 *                 type: string
 *                 example: Late arrival due to traffic
 *     responses:
 *       201:
 *         description: Attendance recorded successfully
 */
router.post('/record', attendancesController.recordAttendance);

/**
 * @swagger
 * /api/attendances/my-history:
 *   get:
 *     summary: Get current employee's attendance history
 *     tags: [Attendances]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           default: 1
 *     responses:
 *       200:
 *         description: Attendance history
 */
router.get('/my-history', attendancesController.getMyAttendances);

/**
 * @swagger
 * /api/attendances/today:
 *   get:
 *     summary: Get today's attendance record
 *     tags: [Attendances]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Today's attendance
 */
router.get('/today', attendancesController.getTodayAttendance);

/**
 * @swagger
 * /api/attendances/daily-summary:
 *   get:
 *     summary: Get daily attendance summary (Admin/Manager only)
 *     tags: [Attendances]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Daily attendance summary
 */
router.get(
  '/daily-summary',
  restrictTo('ADMIN_RH', 'MANAGER'),
  attendancesController.getDailySummary
);

module.exports = router;