import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import HearingSession from "../models/hearingSessionModel.js";
import Case from "../models/caseModel.js";
import Attendance from "../models/attendanceModel.js";
import { generateHearingQRCode, verifyQRCode } from "../utils/qrCodeUtils.js";
import { sendHearingReminder } from "../utils/notificationUtils.js";

/**
 * Create a hearing session with QR code
 * POST /api/hearings
 */
export const createHearingSession = async (req, res, next) => {
  try {
    const { caseId, hearingDate, hearingTime, courtName } = req.body;

    if (!caseId || !hearingDate || !hearingTime || !courtName) {
      return next(new ApiError(400, "caseId, hearingDate, hearingTime, and courtName are required"));
    }

    // Check if case exists
    const caseDoc = await Case.findById(caseId)
      .populate("investigatingOfficer")
      .populate("witnesses");
    
    if (!caseDoc) {
      return next(new ApiError(404, "Case not found"));
    }

    // Generate QR code
    const { qrCode, qrCodeData } = generateHearingQRCode(caseDoc.caseId, hearingDate);

    // Create hearing session
    const hearingSession = await HearingSession.create({
      caseId,
      hearingDate: new Date(hearingDate),
      hearingTime,
      qrCode,
      qrCodeData,
      courtName,
      createdBy: req.userId
    });

    // Create attendance records for officer and witnesses
    const attendanceRecords = [];

    // Officer attendance
    if (caseDoc.investigatingOfficer) {
      attendanceRecords.push({
        hearingSessionId: hearingSession._id,
        caseId: caseDoc._id,
        userId: caseDoc.investigatingOfficer._id,
        userType: "officer",
        userModel: "Auth",
        hearingDate: new Date(hearingDate),
        hearingTime,
        courtName,
        status: "not-marked"
      });
    }

    // Witnesses attendance
    if (caseDoc.witnesses && caseDoc.witnesses.length > 0) {
      for (const witness of caseDoc.witnesses) {
        attendanceRecords.push({
          hearingSessionId: hearingSession._id,
          caseId: caseDoc._id,
          userId: witness._id,
          userType: "witness",
          userModel: "Witness",
          hearingDate: new Date(hearingDate),
          hearingTime,
          courtName,
          status: "not-marked"
        });
      }
    }

    if (attendanceRecords.length > 0) {
      await Attendance.insertMany(attendanceRecords);
    }

    return res.status(201).json(new ApiResponse(201, hearingSession));
  } catch (error) {
    console.error(error);
    next(new ApiError(500, "Failed to create hearing session"));
  }
};

/**
 * Get hearing session by ID with QR code
 * GET /api/hearings/:id
 */
export const getHearingSession = async (req, res, next) => {
  try {
    const { id } = req.params;

    const hearingSession = await HearingSession.findById(id)
      .populate("caseId")
      .populate("createdBy", "username email");

    if (!hearingSession) {
      return next(new ApiError(404, "Hearing session not found"));
    }

    return res.status(200).json(new ApiResponse(200, hearingSession));
  } catch (error) {
    console.error(error);
    next(new ApiError(500, "Failed to fetch hearing session"));
  }
};

/**
 * Get hearing sessions for a case
 * GET /api/hearings/case/:caseId
 */
export const getHearingsByCase = async (req, res, next) => {
  try {
    const { caseId } = req.params;

    const hearingSessions = await HearingSession.find({ caseId })
      .sort({ hearingDate: -1 })
      .populate("createdBy", "username email");

    return res.status(200).json(new ApiResponse(200, hearingSessions));
  } catch (error) {
    console.error(error);
    next(new ApiError(500, "Failed to fetch hearing sessions"));
  }
};

/**
 * Get upcoming hearings
 * GET /api/hearings/upcoming
 */
export const getUpcomingHearings = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const hearingSessions = await HearingSession.find({
      hearingDate: { $gte: today },
      status: { $in: ["scheduled", "ongoing"] }
    })
      .sort({ hearingDate: 1 })
      .populate("caseId")
      .populate("createdBy", "username email");

    return res.status(200).json(new ApiResponse(200, hearingSessions));
  } catch (error) {
    console.error(error);
    next(new ApiError(500, "Failed to fetch upcoming hearings"));
  }
};

/**
 * Verify QR code and mark attendance
 * POST /api/hearings/scan-qr
 */
export const scanQRCode = async (req, res, next) => {
  try {
    const { qrCode, userId, userType } = req.body;

    if (!qrCode || !userId || !userType) {
      return next(new ApiError(400, "qrCode, userId, and userType are required"));
    }

    // Find hearing session by QR code
    const hearingSession = await HearingSession.findOne({ qrCode })
      .populate("caseId");

    if (!hearingSession) {
      return next(new ApiError(404, "Invalid QR code"));
    }

    // Check if hearing is today
    const hearingDate = new Date(hearingSession.hearingDate);
    hearingDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (hearingDate.getTime() !== today.getTime()) {
      return next(new ApiError(400, "This QR code is not valid for today's hearing"));
    }

    // Find attendance record
    const attendance = await Attendance.findOne({
      hearingSessionId: hearingSession._id,
      userId,
      userType
    });

    if (!attendance) {
      return next(new ApiError(404, "Attendance record not found"));
    }

    // Check if already marked
    if (attendance.status === "present") {
      return res.status(200).json(new ApiResponse(200, { 
        message: "Attendance already marked",
        attendance 
      }));
    }

    // Mark attendance
    attendance.status = "present";
    attendance.arrivalTime = new Date();
    attendance.markedViaQR = true;
    attendance.qrScannedAt = new Date();
    await attendance.save();

    return res.status(200).json(new ApiResponse(200, {
      message: "Attendance marked successfully",
      attendance
    }));
  } catch (error) {
    console.error(error);
    next(new ApiError(500, "Failed to scan QR code"));
  }
};

/**
 * Manual attendance marking by liaison officer
 * POST /api/hearings/mark-attendance
 */
export const markAttendanceManually = async (req, res, next) => {
  try {
    const { hearingSessionId, userId, userType, status, remarks } = req.body;

    if (!hearingSessionId || !userId || !userType || !status) {
      return next(new ApiError(400, "hearingSessionId, userId, userType, and status are required"));
    }

    // Find attendance record
    const attendance = await Attendance.findOne({
      hearingSessionId,
      userId,
      userType
    });

    if (!attendance) {
      return next(new ApiError(404, "Attendance record not found"));
    }

    // Update attendance
    attendance.status = status;
    attendance.markedBy = req.userId;
    attendance.remarks = remarks;
    if (status === "present" && !attendance.arrivalTime) {
      attendance.arrivalTime = new Date();
    }
    await attendance.save();

    return res.status(200).json(new ApiResponse(200, {
      message: "Attendance marked successfully",
      attendance
    }));
  } catch (error) {
    console.error(error);
    next(new ApiError(500, "Failed to mark attendance"));
  }
};

/**
 * Get attendance for a hearing session
 * GET /api/hearings/:hearingSessionId/attendance
 */
export const getHearingAttendance = async (req, res, next) => {
  try {
    const { hearingSessionId } = req.params;

    const attendanceRecords = await Attendance.find({ hearingSessionId })
      .populate("userId")
      .populate("markedBy", "username email");

    return res.status(200).json(new ApiResponse(200, attendanceRecords));
  } catch (error) {
    console.error(error);
    next(new ApiError(500, "Failed to fetch attendance"));
  }
};

/**
 * Send hearing reminders
 * POST /api/hearings/:hearingSessionId/send-reminders
 */
export const sendReminders = async (req, res, next) => {
  try {
    const { hearingSessionId } = req.params;

    const hearingSession = await HearingSession.findById(hearingSessionId);
    if (!hearingSession) {
      return next(new ApiError(404, "Hearing session not found"));
    }

    const caseDoc = await Case.findById(hearingSession.caseId)
      .populate("investigatingOfficer")
      .populate("witnesses");

    if (!caseDoc) {
      return next(new ApiError(404, "Case not found"));
    }

    await sendHearingReminder(caseDoc, hearingSession);

    hearingSession.reminderSent = true;
    await hearingSession.save();

    return res.status(200).json(new ApiResponse(200, { 
      message: "Reminders sent successfully" 
    }));
  } catch (error) {
    console.error(error);
    next(new ApiError(500, "Failed to send reminders"));
  }
};
