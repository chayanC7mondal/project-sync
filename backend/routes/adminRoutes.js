import { Router } from "express";
import { getSystemTheme, setSystemTheme, generateReport } from "../controllers/adminController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const adminRoutes = Router();

adminRoutes.get("/system-theme", verifyToken, getSystemTheme);
adminRoutes.post("/system-theme", verifyToken, setSystemTheme);
adminRoutes.post("/generate-report", verifyToken, generateReport);

export default adminRoutes;