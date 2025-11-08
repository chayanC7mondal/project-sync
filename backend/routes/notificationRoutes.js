import { Router } from "express";
import {
  getNotifications,
  createNotification,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadCount,
  deleteNotification,
} from "../controllers/notificationController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const notificationRoutes = Router();

// Get user notifications
notificationRoutes.get("/", verifyToken, getNotifications);

// Create new notification
notificationRoutes.post("/", verifyToken, createNotification);

// Mark single notification as read
notificationRoutes.patch("/:id/read", verifyToken, markNotificationRead);

// Mark all notifications as read
notificationRoutes.patch(
  "/mark-all-read",
  verifyToken,
  markAllNotificationsRead
);

// Get unread notification count
notificationRoutes.get("/unread-count", verifyToken, getUnreadCount);

// Delete notification
notificationRoutes.delete("/:id", verifyToken, deleteNotification);

export default notificationRoutes;
