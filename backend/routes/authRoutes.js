import { Router } from "express";
import { login, logout, validateToken } from "../controllers/authController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const authRoutes = Router();

authRoutes.post("/login", login);
authRoutes.post("/logout", verifyToken, logout);
authRoutes.get("/validate", validateToken);

export default authRoutes;