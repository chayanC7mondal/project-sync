import { Router } from "express";
import { login, logout, validateToken, signup } from "../controllers/authController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const authRoutes = Router();

authRoutes.post("/login", login);
authRoutes.post("/signup", signup);
authRoutes.post("/logout", logout);
authRoutes.get("/validate", validateToken);

export default authRoutes;