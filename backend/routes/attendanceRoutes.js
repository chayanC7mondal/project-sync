import { Router } from "express";
import { getTodayAttendance, markAttendance, getAttendanceReport } from "../controllers/attendanceController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const attendanceRoutes = Router();

attendanceRoutes.get("/today", verifyToken, getTodayAttendance);
attendanceRoutes.post("/", verifyToken, markAttendance);
attendanceRoutes.get("/report", verifyToken, getAttendanceReport);

export default attendanceRoutes;