import { Router } from "express";
import { getNotifications, createNotification, markNotificationRead } from "../controllers/notificationController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const notificationRoutes = Router();

notificationRoutes.get("/", verifyToken, getNotifications);
notificationRoutes.post("/", verifyToken, createNotification);
notificationRoutes.patch("/:id/read", verifyToken, markNotificationRead);

export default notificationRoutes;