import { Router } from "express";
import {
  createCompleteCase,
  markAttendanceAutomated,
  getCompleteCaseDetails,
  getQRCodesForCase,
  createTestUsers,
} from "../controllers/automationController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const automationRoutes = Router();

// Create test users (no auth required for setup)
automationRoutes.post("/create-users", createTestUsers);

// Create complete case with witness, IO, hearing session, and QR codes
automationRoutes.post("/create-complete-case", verifyToken, createCompleteCase);

// Mark attendance using QR code or manual code
automationRoutes.post("/mark-attendance", verifyToken, markAttendanceAutomated);

// Get complete case details with all related records
automationRoutes.get("/case-details/:caseId", verifyToken, getCompleteCaseDetails);

// Get QR codes for a specific case
automationRoutes.get("/qr-codes/:caseId", verifyToken, getQRCodesForCase);

export default automationRoutes;
