import { Router } from "express";
import {
  createHearingSession,
  getHearingSession,
  getHearingsByCase,
  getUpcomingHearings,
  scanQRCode,
  markAttendanceManually,
  getHearingAttendance,
  sendReminders
} from "../controllers/hearingController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const hearingRoutes = Router();

// Create hearing session with QR code
hearingRoutes.post("/", verifyToken, createHearingSession);

// Get hearing session by ID
hearingRoutes.get("/:id", verifyToken, getHearingSession);

// Get hearings for a case
hearingRoutes.get("/case/:caseId", verifyToken, getHearingsByCase);

// Get upcoming hearings
hearingRoutes.get("/upcoming/all", verifyToken, getUpcomingHearings);

// Scan QR code to mark attendance
hearingRoutes.post("/scan-qr", verifyToken, scanQRCode);

// Manual attendance marking by liaison officer
hearingRoutes.post("/mark-attendance", verifyToken, markAttendanceManually);

// Get attendance for a hearing session
hearingRoutes.get("/:hearingSessionId/attendance", verifyToken, getHearingAttendance);

// Send hearing reminders
hearingRoutes.post("/:hearingSessionId/send-reminders", verifyToken, sendReminders);

export default hearingRoutes;
