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
 *     summary: Get all notifications for current user with pagination
 *     tags: [Notifications]
 *     parameters:
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
 *       - in: query
 *         name: isRead
 *         schema:
 *           type: boolean
 *         description: Filter by read status
 *     responses:
 *       200:
 *         description: List of notifications with pagination
 */
router.get('/', notificationsController.getMyNotifications);

/**
 * @swagger
 * /api/notifications/unread:
 *   get:
 *     summary: Get unread notifications only
 *     tags: [Notifications]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 20
 *     responses:
 *       200:
 *         description: List of unread notifications
 */
router.get('/unread/list', notificationsController.getUnreadNotifications);

/**
 * @swagger
 * /api/notifications/{id}:
 *   get:
 *     summary: Get notification by ID
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification details
 *       404:
 *         description: Notification not found
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
