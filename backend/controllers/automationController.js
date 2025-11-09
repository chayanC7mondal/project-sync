import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import Case from "../models/caseModel.js";
import Witness from "../models/witnessModel.js";
import Auth from "../models/authModel.js";
import HearingSession from "../models/hearingSessionModel.js";
import Attendance from "../models/attendanceModel.js";
import { generateHearingQRCode } from "../utils/qrCodeUtils.js";
import crypto from "crypto";

/**
 * POST /api/automation/create-complete-case
 * Creates a complete case with:
 * - Case record
 * - Witness assignment
 * - IO assignment
 * - Hearing session with QR codes
 * - Attendance records for both witness and IO
 */
export const createCompleteCase = async (req, res, next) => {
  try {
    const {
      // Case details
      firNumber,
      firDate,
      policeStation,
      sections,
      courtName,
      courtNumber,
      judge,
      nextHearingDate,
      hearingTime,
      status,
      remarks,
      // Witness details
      witnessUsername, // e.g., "rahul_mishra"
      // IO details
      ioUsername, // e.g., "suresh_dash"
      // Liaison Officer (optional)
      liaisonUsername,
    } = req.body;

    // Validate required fields
    if (!firNumber || !policeStation || !courtName || !nextHearingDate || !hearingTime) {
      return next(new ApiError(400, "Missing required fields: firNumber, policeStation, courtName, nextHearingDate, hearingTime"));
    }

    if (!witnessUsername || !ioUsername) {
      return next(new ApiError(400, "Missing required fields: witnessUsername, ioUsername"));
    }

    // Step 1: Find IO by username
    const io = await Auth.findOne({ username: ioUsername, role: "io" });
    if (!io) {
      return next(new ApiError(404, `Investigating Officer with username '${ioUsername}' not found`));
    }

    // Step 2: Find Liaison Officer (optional)
    let liaison = null;
    if (liaisonUsername) {
      liaison = await Auth.findOne({ username: liaisonUsername, role: "liaison" });
      if (!liaison) {
        return next(new ApiError(404, `Liaison Officer with username '${liaisonUsername}' not found`));
      }
    }

    // Step 3: Find or Create Witness by username
    let witness = await Auth.findOne({ username: witnessUsername, role: "witness" });
    if (!witness) {
      return next(new ApiError(404, `Witness with username '${witnessUsername}' not found. Please create witness account first.`));
    }

    // Step 4: Find or create witness profile in Witness collection
    let witnessProfile = await Witness.findOne({ witnessId: witnessUsername });
    if (!witnessProfile) {
      // Create witness profile
      witnessProfile = await Witness.create({
        witnessId: witnessUsername,
        name: witness.name || witnessUsername,
        age: 30,
        gender: "male",
        phone: witness.phone || "0000000000",
        email: witness.email,
        address: "Auto-generated",
        cases: [],
      });
    }

    // Step 5: Generate unique case ID
    const caseId = `CASE/${new Date().getFullYear()}/${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

    // Step 6: Create Case
    const newCase = await Case.create({
      caseId,
      firNumber,
      firDate: firDate || new Date(),
      policeStation,
      sections: sections || ["IPC 302", "IPC 120B"],
      courtName,
      courtNumber: courtNumber || "Court Room 101",
      judge: judge || "Hon'ble Justice Kumar",
      investigatingOfficer: io._id,
      liaisonOfficer: liaison ? liaison._id : null,
      witnesses: [witnessProfile._id],
      nextHearingDate: new Date(nextHearingDate),
      hearingTime,
      status: status || "pending",
      attendanceStatus: "not-marked",
      remarks: remarks || "Auto-generated case for testing",
      isActive: true,
    });

    // Step 7: Update witness profile to link case
    witnessProfile.cases.push(newCase._id);
    await witnessProfile.save();

    // Step 8: Generate QR codes for hearing session
    const { qrCode, qrCodeData, manualCode } = generateHearingQRCode(
      caseId,
      nextHearingDate
    );

    // Step 9: Create Hearing Session
    const hearingSession = await HearingSession.create({
      caseId: newCase._id,
      hearingDate: new Date(nextHearingDate),
      hearingTime,
      qrCode,
      qrCodeData,
      manualCode,
      courtName,
      status: "scheduled",
      createdBy: liaison ? liaison._id : io._id,
      notificationSent: false,
      reminderSent: false,
    });

    // Step 10: Create Attendance Records for Witness
    const witnessAttendance = await Attendance.create({
      hearingSessionId: hearingSession._id,
      caseId: newCase._id,
      userId: witness._id,
      userType: "witness",
      userModel: "Auth",
      hearingDate: new Date(nextHearingDate),
      hearingTime,
      courtName,
      status: "not-marked",
      markedViaQR: false,
      isVerified: false,
      absenceNotificationSent: false,
    });

    // Step 11: Create Attendance Records for IO
    const ioAttendance = await Attendance.create({
      hearingSessionId: hearingSession._id,
      caseId: newCase._id,
      userId: io._id,
      userType: "officer",
      userModel: "Auth",
      hearingDate: new Date(nextHearingDate),
      hearingTime,
      courtName,
      status: "not-marked",
      markedViaQR: false,
      isVerified: false,
      absenceNotificationSent: false,
    });

    // Step 12: Populate and return complete data
    const populatedCase = await Case.findById(newCase._id)
      .populate("investigatingOfficer", "username name email phone")
      .populate("liaisonOfficer", "username name email phone")
      .populate("witnesses", "witnessId name phone email");

    const response = {
      case: populatedCase,
      hearingSession: {
        _id: hearingSession._id,
        hearingDate: hearingSession.hearingDate,
        hearingTime: hearingSession.hearingTime,
        qrCode: hearingSession.qrCode,
        manualCode: hearingSession.manualCode,
        courtName: hearingSession.courtName,
        status: hearingSession.status,
      },
      attendance: {
        witness: witnessAttendance,
        io: ioAttendance,
      },
      qrDetails: {
        qrCode,
        manualCode,
        qrCodeData,
      },
    };

    return res.status(201).json(
      new ApiResponse(201, response, "Complete case created successfully with QR codes and attendance records")
    );
  } catch (error) {
    console.error("Error in createCompleteCase:", error);
    next(new ApiError(500, error.message || "Failed to create complete case"));
  }
};

/**
 * POST /api/automation/mark-attendance
 * Marks attendance using QR code or manual code
 */
export const markAttendanceAutomated = async (req, res, next) => {
  try {
    const { code, username, codeType } = req.body;

    if (!code || !username) {
      return next(new ApiError(400, "Missing required fields: code, username"));
    }

    // Find user
    const user = await Auth.findOne({ username });
    if (!user) {
      return next(new ApiError(404, `User with username '${username}' not found`));
    }

    // Find hearing session by QR code or manual code
    let hearingSession;
    if (codeType === "manual") {
      hearingSession = await HearingSession.findOne({ manualCode: code });
    } else {
      hearingSession = await HearingSession.findOne({ qrCode: code });
    }

    if (!hearingSession) {
      return next(new ApiError(404, "Invalid code or hearing session not found"));
    }

    // Find attendance record for this user and hearing
    const attendance = await Attendance.findOne({
      hearingSessionId: hearingSession._id,
      userId: user._id,
    });

    if (!attendance) {
      return next(new ApiError(404, "Attendance record not found for this user and hearing"));
    }

    // Check if already marked
    if (attendance.status !== "not-marked") {
      return res.status(200).json(
        new ApiResponse(200, attendance, `Attendance already marked as ${attendance.status}`)
      );
    }

    // Mark attendance
    attendance.status = "present";
    attendance.arrivalTime = new Date();
    attendance.markedViaQR = codeType !== "manual";
    attendance.qrScannedAt = new Date();
    attendance.isVerified = true;
    await attendance.save();

    // Update case attendance status
    const caseDoc = await Case.findById(attendance.caseId);
    if (caseDoc) {
      caseDoc.attendanceStatus = "present";
      await caseDoc.save();
    }

    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate("caseId", "caseId firNumber courtName")
      .populate("hearingSessionId", "hearingDate hearingTime qrCode manualCode");

    return res.status(200).json(
      new ApiResponse(200, populatedAttendance, "Attendance marked successfully")
    );
  } catch (error) {
    console.error("Error in markAttendanceAutomated:", error);
    next(new ApiError(500, error.message || "Failed to mark attendance"));
  }
};

/**
 * GET /api/automation/case-details/:caseId
 * Get complete case details with all related records
 */
export const getCompleteCaseDetails = async (req, res, next) => {
  try {
    const { caseId } = req.params;

    const caseDoc = await Case.findOne({ caseId })
      .populate("investigatingOfficer", "username name email phone role")
      .populate("liaisonOfficer", "username name email phone role")
      .populate("witnesses", "witnessId name phone email");

    if (!caseDoc) {
      return next(new ApiError(404, "Case not found"));
    }

    const hearingSessions = await HearingSession.find({ caseId: caseDoc._id })
      .sort({ hearingDate: -1 });

    const attendance = await Attendance.find({ caseId: caseDoc._id })
      .populate("userId", "username name email role")
      .populate("hearingSessionId", "hearingDate hearingTime qrCode manualCode");

    const response = {
      case: caseDoc,
      hearingSessions,
      attendance,
    };

    return res.status(200).json(
      new ApiResponse(200, response, "Complete case details retrieved successfully")
    );
  } catch (error) {
    console.error("Error in getCompleteCaseDetails:", error);
    next(new ApiError(500, error.message || "Failed to fetch case details"));
  }
};

/**
 * GET /api/automation/qr-codes/:caseId
 * Get QR codes for a specific case
 */
export const getQRCodesForCase = async (req, res, next) => {
  try {
    const { caseId } = req.params;

    const caseDoc = await Case.findOne({ caseId });
    if (!caseDoc) {
      return next(new ApiError(404, "Case not found"));
    }

    const hearingSessions = await HearingSession.find({ caseId: caseDoc._id })
      .select("hearingDate hearingTime qrCode manualCode qrCodeData courtName status")
      .sort({ hearingDate: -1 });

    return res.status(200).json(
      new ApiResponse(200, hearingSessions, "QR codes retrieved successfully")
    );
  } catch (error) {
    console.error("Error in getQRCodesForCase:", error);
    next(new ApiError(500, error.message || "Failed to fetch QR codes"));
  }
};

/**
 * POST /api/automation/create-users
 * Create test users (witness and IO) if they don't exist
 */
export const createTestUsers = async (req, res, next) => {
  try {
    const bcrypt = (await import("bcryptjs")).default;
    const users = [];

    // Create IO user (suresh_dash)
    let io = await Auth.findOne({ username: "suresh_dash" });
    if (!io) {
      const hashedPassword = await bcrypt.hash("password123", 10);
      io = await Auth.create({
        username: "suresh_dash",
        password: hashedPassword,
        name: "Suresh Dash",
        email: "suresh.dash@police.gov.in",
        phone: "9876543210",
        role: "io",
        isActive: true,
      });
      users.push({ type: "IO", user: io });
    } else {
      users.push({ type: "IO (existing)", user: io });
    }

    // Create Witness user (rahul_mishra)
    let witness = await Auth.findOne({ username: "rahul_mishra" });
    if (!witness) {
      const hashedPassword = await bcrypt.hash("password123", 10);
      witness = await Auth.create({
        username: "rahul_mishra",
        password: hashedPassword,
        name: "Rahul Mishra",
        email: "rahul.mishra@example.com",
        phone: "9876543211",
        role: "witness",
        isActive: true,
      });
      users.push({ type: "Witness", user: witness });
    } else {
      users.push({ type: "Witness (existing)", user: witness });
    }

    // Create Liaison Officer (optional)
    let liaison = await Auth.findOne({ username: "liaison_officer" });
    if (!liaison) {
      const hashedPassword = await bcrypt.hash("password123", 10);
      liaison = await Auth.create({
        username: "liaison_officer",
        password: hashedPassword,
        name: "Liaison Officer",
        email: "liaison@police.gov.in",
        phone: "9876543212",
        role: "liaison",
        isActive: true,
      });
      users.push({ type: "Liaison", user: liaison });
    } else {
      users.push({ type: "Liaison (existing)", user: liaison });
    }

    return res.status(201).json(
      new ApiResponse(201, users, "Test users created/verified successfully")
    );
  } catch (error) {
    console.error("Error in createTestUsers:", error);
    next(new ApiError(500, error.message || "Failed to create test users"));
  }
};
