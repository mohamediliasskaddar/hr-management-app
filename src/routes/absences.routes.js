const express = require('express');
const router = express.Router();
const absencesController = require('../controllers/absences.controller');
const { protect } = require('../middlewares/auth.middleware');
const { attachEmployeeToUser } = require('../middlewares/employee.middleware');
const { restrictTo } = require('../middlewares/auth.middleware');
const  AppError  = require('../utils/appError');

// All routes require authentication
router.use(protect);
/**
 * @swagger
 * /api/absences:
 *   post:
 *     summary: Declare an absence (Manager/Admin only)
 *     tags: [Absences]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [employee_id, absence_date, reason]
 *             properties:
 *               employee_id:
 *                 type: string
 *               absence_date:
 *                 type: string
 *                 format: date
 *               reason:
 *                 type: string
 *               is_justified:
 *                 type: boolean
 *                 default: false
 *               absence_type:
 *                type: string
 *                enum: [MALADIE, PERSONNEL, NON_JUSTIFIE, AUTRE]
 *                default: PERSONNEL
 *     responses:
 *       201:
 *         description: Absence declared successfully
 */
router.post(
  '/',
  restrictTo('MANAGER', 'ADMIN_RH'),
  absencesController.declareAbsence
);

/**
 * @swagger
 * /api/absences/{id}/justification:
 *   post:
 *     summary: Submit justification for absence
 *     tags: [Absences]
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
 *             required: [justification_text]
 *             properties:
 *               justification_text:
 *                 type: string
 *               attachment_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Justification submitted successfully
 */
router.post('/:id/justification', attachEmployeeToUser, absencesController.submitJustification);

/**
 * @swagger
 * /api/absences/{id}/process-justification:
 *   patch:
 *     summary: Process justification (Manager/Admin only)
 *     tags: [Absences]
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
 *                 enum: [APPROVED, REJECTED]
 *               comments:
 *                 type: string
 *     responses:
 *       200:
 *         description: Justification processed successfully
 */
router.patch(
  '/:id/process-justification',
  restrictTo('MANAGER', 'ADMIN_RH'),
  absencesController.processJustification
);

/**
 * @swagger
 * /api/absences/management/all:
 *   get:
 *     summary: Get all absences with justifications (Admin/Manager only)
 *     tags: [Absences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: employeeId
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [NON_FOURNI, EN_ATTENTE, VALIDE, REFUSE]
 *       - in: query
 *         name: dateStart
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: dateEnd
 *         schema:
 *           type: string
 *           format: date
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
 *         description: List of absences with justifications
 */
router.get(
  '/management/all',
  restrictTo('ADMIN_RH', 'MANAGER'),
  absencesController.getAllAbsences
);

/**
 * @swagger
 * /api/absences:
 *   get:
 *     summary: Get absences list (role-based)
 *     tags: [Absences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [NON_FOURNI, EN_ATTENTE, VALIDE, REFUSE]
 *       - in: query
 *         name: dateStart
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: dateEnd
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Absences retrieved successfully
 */
router.get(
  '/',
  attachEmployeeToUser,
  absencesController.getAbsences
);

module.exports = router;