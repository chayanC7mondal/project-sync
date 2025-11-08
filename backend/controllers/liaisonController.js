import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import Case from "../models/caseModel.js";
import HearingSession from "../models/hearingSessionModel.js";
import Attendance from "../models/attendanceModel.js";
import AbsenceReason from "../models/absenceReasonModel.js";

/**
 * Get liaison officer dashboard overview
 * GET /api/liaison/dashboard
 */
export const getLiaisonDashboard = async (req, res, next) => {
  try {
    const liaisonOfficerId = req.userId;

    // Get cases assigned to this liaison officer
    const assignedCases = await Case.find({ 
      liaisonOfficer: liaisonOfficerId,
      isActive: true 
    }).populate("investigatingOfficer", "username email")
      .populate("witnesses", "name phone");

    // Get upcoming hearings for assigned cases
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const caseIds = assignedCases.map(c => c._id);

    const upcomingHearings = await HearingSession.find({
      caseId: { $in: caseIds },
      hearingDate: { $gte: today },
      status: { $in: ["scheduled", "ongoing"] }
    })
      .sort({ hearingDate: 1 })
      .limit(10)
      .populate("caseId");

    // Get today's hearings
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayHearings = await HearingSession.find({
      caseId: { $in: caseIds },
      hearingDate: { $gte: today, $lt: tomorrow }
    }).populate("caseId");

    // Get attendance summary for today
    const todayHearingIds = todayHearings.map(h => h._id);
    const todayAttendance = await Attendance.find({
      hearingSessionId: { $in: todayHearingIds }
    });

    const attendanceSummary = {
      total: todayAttendance.length,
      present: todayAttendance.filter(a => a.status === "present").length,
      absent: todayAttendance.filter(a => a.status === "absent").length,
      notMarked: todayAttendance.filter(a => a.status === "not-marked").length
    };

    // Get pending absence reasons
    const pendingAbsenceReasons = await AbsenceReason.find({
      caseId: { $in: caseIds },
      status: "pending"
    })
      .populate("userId")
      .populate("hearingSessionId")
      .limit(5);

    const dashboardData = {
      totalCases: assignedCases.length,
      upcomingHearings: upcomingHearings.length,
      todayHearings: todayHearings.length,
      attendanceSummary,
      recentCases: assignedCases.slice(0, 5),
      upcomingHearingsList: upcomingHearings,
      todayHearingsList: todayHearings,
      pendingAbsenceReasons
    };

    return res.status(200).json(new ApiResponse(200, dashboardData));
  } catch (error) {
    console.error(error);
    next(new ApiError(500, "Failed to fetch liaison dashboard"));
  }
};

/**
 * Get cases assigned to liaison officer
 * GET /api/liaison/cases
 */
export const getLiaisonCases = async (req, res, next) => {
  try {
    const liaisonOfficerId = req.userId;

    const cases = await Case.find({ 
      liaisonOfficer: liaisonOfficerId,
      isActive: true 
    })
      .populate("investigatingOfficer", "username email rank")
      .populate("witnesses", "name phone email")
      .sort({ nextHearingDate: 1 });

    return res.status(200).json(new ApiResponse(200, cases));
  } catch (error) {
    console.error(error);
    next(new ApiError(500, "Failed to fetch liaison cases"));
  }
};

/**
 * Get today's hearings for liaison officer
 * GET /api/liaison/hearings/today
 */
export const getTodayHearings = async (req, res, next) => {
  try {
    const liaisonOfficerId = req.userId;

    // Get cases assigned to liaison officer
    const assignedCases = await Case.find({ 
      liaisonOfficer: liaisonOfficerId,
      isActive: true 
    });

    const caseIds = assignedCases.map(c => c._id);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayHearings = await HearingSession.find({
      caseId: { $in: caseIds },
      hearingDate: { $gte: today, $lt: tomorrow }
    })
      .populate("caseId")
      .sort({ hearingTime: 1 });

    // Get attendance for each hearing
    const hearingsWithAttendance = await Promise.all(
      todayHearings.map(async (hearing) => {
        const attendance = await Attendance.find({
          hearingSessionId: hearing._id
        }).populate("userId");

        return {
          ...hearing.toObject(),
          attendance
        };
      })
    );

    return res.status(200).json(new ApiResponse(200, hearingsWithAttendance));
  } catch (error) {
    console.error(error);
    next(new ApiError(500, "Failed to fetch today's hearings"));
  }
};

/**
 * Get attendance report for a specific case
 * GET /api/liaison/cases/:caseId/attendance
 */
export const getCaseAttendanceReport = async (req, res, next) => {
  try {
    const { caseId } = req.params;
    const liaisonOfficerId = req.userId;

    // Verify case is assigned to this liaison officer
    const caseDoc = await Case.findOne({
      _id: caseId,
      liaisonOfficer: liaisonOfficerId
    });

    if (!caseDoc) {
      return next(new ApiError(404, "Case not found or not assigned to you"));
    }

    // Get all attendance records for this case
    const attendanceRecords = await Attendance.find({ caseId })
      .populate("userId")
      .populate("hearingSessionId")
      .populate("markedBy", "username email")
      .sort({ hearingDate: -1 });

    // Group by hearing session
    const hearingSessions = await HearingSession.find({ caseId })
      .sort({ hearingDate: -1 });

    const report = hearingSessions.map(hearing => {
      const sessionAttendance = attendanceRecords.filter(
        a => a.hearingSessionId._id.toString() === hearing._id.toString()
      );

      return {
        hearing,
        attendance: sessionAttendance,
        summary: {
          total: sessionAttendance.length,
          present: sessionAttendance.filter(a => a.status === "present").length,
          absent: sessionAttendance.filter(a => a.status === "absent").length,
          notMarked: sessionAttendance.filter(a => a.status === "not-marked").length
        }
      };
    });

    return res.status(200).json(new ApiResponse(200, report));
  } catch (error) {
    console.error(error);
    next(new ApiError(500, "Failed to fetch case attendance report"));
  }
};

/**
 * Get absence reasons for liaison officer's cases
 * GET /api/liaison/absence-reasons
 */
export const getLiaisonAbsenceReasons = async (req, res, next) => {
  try {
    const liaisonOfficerId = req.userId;
    const { status } = req.query;

    // Get cases assigned to liaison officer
    const assignedCases = await Case.find({ 
      liaisonOfficer: liaisonOfficerId,
      isActive: true 
    });

    const caseIds = assignedCases.map(c => c._id);

    const query = { caseId: { $in: caseIds } };
    if (status) {
      query.status = status;
    }

    const absenceReasons = await AbsenceReason.find(query)
      .populate("userId")
      .populate("hearingSessionId")
      .populate("caseId", "caseId firNumber")
      .sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, absenceReasons));
  } catch (error) {
    console.error(error);
    next(new ApiError(500, "Failed to fetch absence reasons"));
  }
};
