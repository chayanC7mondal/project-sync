import { Router } from "express";
import { getSetting, updateSetting } from "../controllers/settingsController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const settingsRoutes = Router();

settingsRoutes.get("/:key", verifyToken, getSetting);
settingsRoutes.put("/:key", verifyToken, updateSetting);

export default settingsRoutes;