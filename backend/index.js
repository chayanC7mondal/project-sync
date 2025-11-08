import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import mongoose from "mongoose";

// Load env
dotenv.config();

// Routes
import authRoutes from "./routes/authRoutes.js";
import caseRoutes from "./routes/caseRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import witnessRoutes from "./routes/witnessRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

import { ApiError } from "./utils/apiError.js";

const app = express();

// Middlewares
app.use(cors({ origin: process.env.CORS_ORIGIN || true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Health
app.get("/health", (_req, res) => res.status(200).send("OK"));

// Mount routes (using our project routes)
app.use("/api/auth", authRoutes);
app.use("/api/cases", caseRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/witnesses", witnessRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);

// 404 handler
app.use((req, res, next) => {
	next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
});

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
	const status = err?.statusCode || 500;
	res.status(status).json({
		statusCode: status,
		data: null,
		message: err?.message || "Internal Server Error",
		success: false,
		errors: err?.errors || [],
	});
});

// Start server + DB
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI ;

mongoose
	.connect(MONGO_URI)
	.then(() => {
		app.listen(PORT, () => {
			console.log(`Server running on port ${PORT}`);
		});
	})
	.catch((err) => {
		console.error("Mongo connection error:", err);
		process.exit(1);
	});

