import { Router } from "express";
import {
  submitAbsenceReason,
  getAbsenceReasonsByHearing,
  getAbsenceReasonsByCase,
  getMyAbsenceReasons,
  updateAbsenceReasonStatus,
  triggerPostHearingNotifications,
  getNotificationStats,
} from "../controllers/absenceController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const absenceRoutes = Router();

// Submit absence reason
absenceRoutes.post("/", verifyToken, submitAbsenceReason);

// Get absence reasons for a hearing session
absenceRoutes.get(
  "/hearing/:hearingSessionId",
  verifyToken,
  getAbsenceReasonsByHearing
);

// Get absence reasons for a case
absenceRoutes.get("/case/:caseId", verifyToken, getAbsenceReasonsByCase);

// Get my absence reasons
absenceRoutes.get("/my", verifyToken, getMyAbsenceReasons);

// Update absence reason status
absenceRoutes.patch("/:id/status", verifyToken, updateAbsenceReasonStatus);

// Manually trigger post-hearing notifications (admin only)
absenceRoutes.post(
  "/trigger-notifications/:hearingSessionId",
  verifyToken,
  triggerPostHearingNotifications
);

// Get notification statistics for dashboard
absenceRoutes.get("/stats", verifyToken, getNotificationStats);

export default absenceRoutes;
