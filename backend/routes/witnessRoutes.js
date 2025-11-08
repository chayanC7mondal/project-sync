import { Router } from "express";
import { getWitnesses, getWitnessById, createWitness, updateWitness } from "../controllers/witnessController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const witnessRoutes = Router();

witnessRoutes.get("/", verifyToken, getWitnesses);
witnessRoutes.get("/:id", verifyToken, getWitnessById);
witnessRoutes.post("/", verifyToken, createWitness);
witnessRoutes.put("/:id", verifyToken, updateWitness);

export default witnessRoutes;