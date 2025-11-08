import { Router } from "express";
import {
  getLiaisonDashboard,
  getLiaisonCases,
  getTodayHearings,
  getCaseAttendanceReport,
  getLiaisonAbsenceReasons
} from "../controllers/liaisonController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const liaisonRoutes = Router();

// Get liaison officer dashboard
liaisonRoutes.get("/dashboard", verifyToken, getLiaisonDashboard);

// Get cases assigned to liaison officer
liaisonRoutes.get("/cases", verifyToken, getLiaisonCases);

// Get today's hearings
liaisonRoutes.get("/hearings/today", verifyToken, getTodayHearings);

// Get attendance report for a case
liaisonRoutes.get("/cases/:caseId/attendance", verifyToken, getCaseAttendanceReport);

// Get absence reasons for liaison officer's cases
liaisonRoutes.get("/absence-reasons", verifyToken, getLiaisonAbsenceReasons);

export default liaisonRoutes;
