import { Router } from "express";
import { getStats, getRecentCases } from "../controllers/dashboardController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const dashboardRoutes = Router();

dashboardRoutes.get("/stats", verifyToken, getStats);
dashboardRoutes.get("/recent-cases", verifyToken, getRecentCases);

export default dashboardRoutes;