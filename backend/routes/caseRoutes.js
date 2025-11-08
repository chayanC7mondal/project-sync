import { Router } from "express";
import { getCases, getCaseById, createCase, updateCase } from "../controllers/caseController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const caseRoutes = Router();

caseRoutes.get("/", verifyToken, getCases);
caseRoutes.get("/:id", verifyToken, getCaseById);
caseRoutes.post("/", verifyToken, createCase);
caseRoutes.put("/:id", verifyToken, updateCase);

export default caseRoutes;