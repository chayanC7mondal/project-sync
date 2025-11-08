import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import AbsenceReason from "../models/absenceReasonModel.js";
import HearingSession from "../models/hearingSessionModel.js";
import Case from "../models/caseModel.js";
import Attendance from "../models/attendanceModel.js";
import Auth from "../models/authModel.js";
import Witness from "../models/witnessModel.js";
import { sendAbsenceNotification } from "../utils/notificationUtils.js";

/**
 * Submit absence reason
 * POST /api/absence-reasons
 */
export const submitAbsenceReason = async (req, res, next) => {
  try {
    const { hearingSessionId, reason, reasonCategory, supportingDocuments } = req.body;
    const userId = req.userId;

    if (!hearingSessionId || !reason) {
      return next(new ApiError(400, "hearingSessionId and reason are required"));
    }

    // Get hearing session
    const hearingSession = await HearingSession.findById(hearingSessionId);
    if (!hearingSession) {
      return next(new ApiError(404, "Hearing session not found"));
    }

    // Get case
    const caseDoc = await Case.findById(hearingSession.caseId)
      .populate("investigatingOfficer")
      .populate("liaisonOfficer");

    if (!caseDoc) {
      return next(new ApiError(404, "Case not found"));
    }

    // Find attendance record to determine user type
    const attendance = await Attendance.findOne({
      hearingSessionId,
      userId
    });

    if (!attendance) {
      return next(new ApiError(404, "Attendance record not found"));
    }

    // Create absence reason
    const absenceReason = await AbsenceReason.create({
      hearingSessionId,
      caseId: hearingSession.caseId,
      userId,
      userType: attendance.userType,
      reason,
      reasonCategory: reasonCategory || "other",
      supportingDocuments: supportingDocuments || [],
      respondedAt: new Date()
    });

    // Update attendance status
    attendance.status = "on-leave";
    attendance.remarks = `Absence reason submitted: ${reason}`;
    await attendance.save();

    // Get user name
    let userName = "Unknown";
    if (attendance.userType === "officer") {
      const officer = await Auth.findById(userId);
      if (officer) userName = officer.username;
    } else if (attendance.userType === "witness") {
      const witness = await Witness.findById(userId);
      if (witness) userName = witness.name;
    }

    // Send notification to upper officers and inspector
    await sendAbsenceNotification(caseDoc, absenceReason, userName, attendance.userType);

    absenceReason.notificationSent = true;
    await absenceReason.save();

    return res.status(201).json(new ApiResponse(201, absenceReason));
  } catch (error) {
    console.error(error);
    next(new ApiError(500, "Failed to submit absence reason"));
  }
};

/**
 * Get absence reasons for a hearing session
 * GET /api/absence-reasons/hearing/:hearingSessionId
 */
export const getAbsenceReasonsByHearing = async (req, res, next) => {
  try {
    const { hearingSessionId } = req.params;

    const absenceReasons = await AbsenceReason.find({ hearingSessionId })
      .populate("userId")
      .sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, absenceReasons));
  } catch (error) {
    console.error(error);
    next(new ApiError(500, "Failed to fetch absence reasons"));
  }
};

/**
 * Get absence reasons for a case
 * GET /api/absence-reasons/case/:caseId
 */
export const getAbsenceReasonsByCase = async (req, res, next) => {
  try {
    const { caseId } = req.params;

    const absenceReasons = await AbsenceReason.find({ caseId })
      .populate("userId")
      .populate("hearingSessionId")
      .sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, absenceReasons));
  } catch (error) {
    console.error(error);
    next(new ApiError(500, "Failed to fetch absence reasons"));
  }
};

/**
 * Get my absence reasons
 * GET /api/absence-reasons/my
 */
export const getMyAbsenceReasons = async (req, res, next) => {
  try {
    const userId = req.userId;

    const absenceReasons = await AbsenceReason.find({ userId })
      .populate("hearingSessionId")
      .populate("caseId")
      .sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, absenceReasons));
  } catch (error) {
    console.error(error);
    next(new ApiError(500, "Failed to fetch absence reasons"));
  }
};

/**
 * Update absence reason status (acknowledge/approve/reject)
 * PATCH /api/absence-reasons/:id/status
 */
export const updateAbsenceReasonStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["acknowledged", "approved", "rejected"].includes(status)) {
      return next(new ApiError(400, "Valid status is required (acknowledged/approved/rejected)"));
    }

    const absenceReason = await AbsenceReason.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!absenceReason) {
      return next(new ApiError(404, "Absence reason not found"));
    }

    return res.status(200).json(new ApiResponse(200, absenceReason));
  } catch (error) {
    console.error(error);
    next(new ApiError(500, "Failed to update absence reason status"));
  }
};

/**
 * Manually trigger post-hearing notifications (admin only)
 * POST /api/absence-reasons/trigger-notifications/:hearingSessionId
 */
export const triggerPostHearingNotifications = async (req, res, next) => {
  try {
    const { hearingSessionId } = req.params;

    // Verify user has admin privileges
    if (req.userRole !== 'admin') {
      return next(new ApiError(403, "Access denied. Admin privileges required."));
    }

    const hearingSession = await HearingSession.findById(hearingSessionId);
    if (!hearingSession) {
      return next(new ApiError(404, "Hearing session not found"));
    }

    // Import and trigger post-hearing notifications
    const { sendPostHearingNotifications } = await import("../services/hearingNotificationService.js");
    await sendPostHearingNotifications(hearingSession);

    // Mark as processed
    hearingSession.postNotificationsSent = true;
    await hearingSession.save();

    return res.status(200).json(
      new ApiResponse(200, null, "Post-hearing notifications triggered successfully")
    );
  } catch (error) {
    console.error("Error triggering notifications:", error);
    return next(new ApiError(500, "Failed to trigger notifications"));
  }
};

/**
 * Get notification statistics for dashboard
 * GET /api/absence-reasons/stats
 */
export const getNotificationStats = async (req, res, next) => {
  try {
    // Get stats for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const stats = {
      totalAbsenceReasons: await AbsenceReason.countDocuments({
        createdAt: { $gte: thirtyDaysAgo }
      }),
      pendingHearings: await HearingSession.countDocuments({
        hearingDate: { $gte: new Date() },
        status: 'scheduled'
      }),
      completedHearings: await HearingSession.countDocuments({
        hearingDate: { $gte: thirtyDaysAgo },
        status: 'completed'
      }),
      notificationsSent: await HearingSession.countDocuments({
        postNotificationsSent: true,
        updatedAt: { $gte: thirtyDaysAgo }
      }),
      weeklyRemindersScheduled: await HearingSession.countDocuments({
        weeklyReminderSent: true,
        updatedAt: { $gte: thirtyDaysAgo }
      }),
      dayOfRemindersScheduled: await HearingSession.countDocuments({
        dayOfReminderSent: true,
        updatedAt: { $gte: thirtyDaysAgo }
      })
    };

    return res.status(200).json(
      new ApiResponse(200, stats, "Notification statistics retrieved successfully")
    );
  } catch (error) {
    console.error("Error retrieving notification stats:", error);
    return next(new ApiError(500, "Failed to retrieve statistics"));
  }
};
