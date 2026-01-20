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
 *     summary: Get all announcements
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, PUBLISHED, ARCHIVED]
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
 *             required: [title, content]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Company Holiday Notice
 *               content:
 *                 type: string
 *                 example: The company will be closed on...
 *               status:
 *                 type: string
 *                 enum: [DRAFT, PUBLISHED, ARCHIVED]
 *                 default: DRAFT
 *               published_date:
 *                 type: string
 *                 format: date-time
 *               expiry_date:
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
 *               status:
 *                 type: string
 *                 enum: [DRAFT, PUBLISHED, ARCHIVED]
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