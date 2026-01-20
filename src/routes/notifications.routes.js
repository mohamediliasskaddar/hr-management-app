const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notifications.controller');
const { protect } = require('../middlewares/auth.middleware');

// Toutes les routes notifications nécessitent d'être authentifié
router.use(protect);

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get all notifications for current user
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: List of notifications
 */
router.get('/', notificationsController.getMyNotifications);

/**
 * @swagger
 * /api/notifications/{id}:
 *   get:
 *     summary: Get a notification by ID
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification details
 */
router.get('/:id', notificationsController.getNotificationById);

/**
 * @swagger
 * /api/notifications/{id}/mark-as-read:
 *   patch:
 *     summary: Mark notification as read
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as read
 */
router.patch('/:id/mark-as-read', notificationsController.markAsRead);

/**
 * @swagger
 * /api/notifications/mark-all-as-read:
 *   patch:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: All notifications marked as read
 */
router.patch('/mark-all-as-read', notificationsController.markAllAsRead);

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: Delete a notification
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Notification deleted
 */
router.delete('/:id', notificationsController.deleteNotification);

module.exports = router;
