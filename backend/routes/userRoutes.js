import { Router } from "express";
import { getThemePreference, saveThemePreference } from "../controllers/userController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const userRoutes = Router();

userRoutes.get("/theme-preference", verifyToken, getThemePreference);
userRoutes.post("/theme-preference", verifyToken, saveThemePreference);

export default userRoutes;