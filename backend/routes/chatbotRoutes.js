import express from "express";
import { handleChatbotQuery } from "../controllers/chatbotController.js";
import { verifyToken, checkRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All chatbot routes require authentication
router.use(verifyToken);

/**
 * @route   POST /api/chatbot/query
 * @desc    Handle chatbot query (AI assistant)
 * @access  Private (Liaison Officer)
 */
router.post("/query", checkRole(["liaison_officer"]), handleChatbotQuery);

export default router;
