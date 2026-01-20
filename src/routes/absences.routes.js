const express = require('express');
const router = express.Router();
const absencesController = require('../controllers/absences.controller');
const { protect } = require('../middlewares/auth.middleware');
const { attachEmployeeToUser } = require('../middlewares/employee.middleware');
const { restrictTo } = require('../middlewares/auth.middleware');

// All routes require authentication
router.use(protect);
router.use(attachEmployeeToUser);

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
router.post(
  '/:id/justification',
  absencesController.submitJustification
);

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

module.exports = router;

// Lister les absences (selon rôle)
router.get('/', absencesController.getAbsences);

module.exports = router;