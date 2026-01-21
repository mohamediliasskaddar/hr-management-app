const Notification = require('../models/notifications.model');
const catchAsync = require('../utils/catchAsync');
const NotificationService = require('../services/notifications.service');
const AppError = require('../utils/appError');

/**
 * Get all notifications for the current user with pagination
 */
exports.getMyNotifications = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20, isRead } = req.query;

  const result = await NotificationService.getNotificationsForUser(
    req.user._id || req.user.id,
    {
      page: Number(page),
      limit: Number(limit),
      isRead: isRead === 'true' ? true : isRead === 'false' ? false : undefined
    }
  );

  res.status(200).json({
    status: 'success',
    data: result
  });
});

/**
 * Get unread notifications
 */
exports.getUnreadNotifications = catchAsync(async (req, res, next) => {
  const { limit = 20 } = req.query;

  const notifications = await NotificationService.getUnreadForUser(
    req.user._id || req.user.id,
    Number(limit)
  );

  res.status(200).json({
    status: 'success',
    data: { 
      notifications, 
      count: notifications.length 
    }
  });
});

/**
 * Get a notification by ID
 */
exports.getNotificationById = catchAsync(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }

  // Vérifier que la notification appartient à l'utilisateur connecté
  const userId = req.user._id || req.user.id;
  if (notification.recipient_id.toString() !== userId.toString()) {
    return next(new AppError('You do not have permission to access this notification', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      notification
    }
  });
});

/**
 * Mark a notification as read
 */
exports.markAsRead = catchAsync(async (req, res, next) => {
  const userId = req.user._id || req.user.id;
  const notification = await NotificationService.markAsRead(req.params.id, userId);

  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      notification
    }
  });
});

/**
 * Mark all notifications as read for the current user
 */
exports.markAllAsRead = catchAsync(async (req, res, next) => {
  const userId = req.user._id || req.user.id;
  const result = await NotificationService.markAllAsRead(userId);

  res.status(200).json({
    status: 'success',
    message: `${result.modifiedCount} notification(s) marked as read`,
    data: { modifiedCount: result.modifiedCount }
  });
});

/**
 * Delete a notification
 */
exports.deleteNotification = catchAsync(async (req, res, next) => {
  const userId = req.user._id || req.user.id;
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }

  // Vérifier que la notification appartient à l'utilisateur connecté
  if (notification.recipient_id.toString() !== userId.toString()) {
    return next(new AppError('You do not have permission to delete this notification', 403));
  }

  await Notification.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});
