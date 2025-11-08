import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import Notification from "../models/notificationModel.js";

// GET /api/notifications
export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    return res.status(200).json(new ApiResponse(200, notifications));
  } catch (error) {
    console.error(error);
    next(new ApiError(500, "Failed to fetch notifications"));
  }
};

// POST /api/notifications (create basic in-app notification)
export const createNotification = async (req, res, next) => {
  try {
    const { recipient, type, title, message, priority, relatedEntityType, relatedEntityId } = req.body || {};
    if (!recipient || !type || !title || !message) {
      return next(new ApiError(400, "recipient, type, title and message are required"));
    }

    const created = await Notification.create({
      recipient,
      type,
      title,
      message,
      priority,
      relatedEntityType,
      relatedEntityId,
    });
    return res.status(201).json(new ApiResponse(201, created));
  } catch (error) {
    console.error(error);
    next(new ApiError(500, "Failed to create notification"));
  }
};

// PATCH /api/notifications/:id/read
export const markNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await Notification.findOneAndUpdate(
      { _id: id, recipient: req.userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
    if (!updated) {
      return next(new ApiError(404, "Notification not found"));
    }
    return res.status(200).json(new ApiResponse(200, updated));
  } catch (error) {
    console.error(error);
    next(new ApiError(500, "Failed to update notification"));
  }
};
