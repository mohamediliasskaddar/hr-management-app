const express = require('express');
const router = express.Router();
const announcementsController = require('../controllers/announcements.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

// All routes require authentication
router.use(protect);

/**
 * @swagger
 * /api/announcements:
 *   get:
 *     summary: Get all announcements (filtered by role and scope)
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *         description: Filter by active announcements
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [LOW, NORMAL, HIGH, URGENT]
 *       - in: query
 *         name: target_scope
 *         schema:
 *           type: string
 *           enum: [ALL_EMPLOYEES, SPECIFIC_TEAM]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by title
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
 *         description: List of announcements
 */

router.get('/', announcementsController.getAllAnnouncements);

/**
 * @swagger
 * /api/announcements:
 *   post:
 *     summary: Create announcement (Manager/Admin only)
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - target_scope
 *             properties:
 *               title:
 *                 type: string
 *                 example: Company Holiday Notice
 *               content:
 *                 type: string
 *                 example: The company will be closed on Friday.
 *               target_scope:
 *                 type: string
 *                 enum: [ALL_EMPLOYEES, SPECIFIC_TEAM]
 *               target_team_manager_id:
 *                 type: string
 *                 description: Required if target_scope is SPECIFIC_TEAM
 *               priority:
 *                 type: string
 *                 enum: [LOW, NORMAL, HIGH, URGENT]
 *                 default: NORMAL
 *               is_active:
 *                 type: boolean
 *                 default: true
 *               published_at:
 *                 type: string
 *                 format: date-time
 *               expires_at:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Announcement created successfully
 */

router.post(
  '/',
  restrictTo('ADMIN_RH', 'MANAGER'),
  announcementsController.createAnnouncement
);

/**
 * @swagger
 * /api/announcements/{id}:
 *   get:
 *     summary: Get announcement details
 *     tags: [Announcements]
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
 *         description: Announcement details
 */
router.get('/:id', announcementsController.getAnnouncement);
/**
 * @swagger
 * /api/announcements/{id}:
 *   patch:
 *     summary: Update announcement (Manager/Admin only)
 *     tags: [Announcements]
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
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               target_scope:
 *                 type: string
 *                 enum: [ALL_EMPLOYEES, SPECIFIC_TEAM]
 *               target_team_manager_id:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [LOW, NORMAL, HIGH, URGENT]
 *               is_active:
 *                 type: boolean
 *               expires_at:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Announcement updated successfully
 */

router.patch(
  '/:id',
  restrictTo('ADMIN_RH', 'MANAGER'),
  announcementsController.updateAnnouncement
);

/**
 * @swagger
 * /api/announcements/{id}:
 *   delete:
 *     summary: Delete announcement (Manager/Admin only)
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Announcement deleted successfully
 */
router.delete(
  '/:id',
  restrictTo('ADMIN_RH', 'MANAGER'),
  announcementsController.deleteAnnouncement
);

module.exports = router;