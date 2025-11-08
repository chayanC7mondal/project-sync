import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import Case from "../models/caseModel.js";
import Attendance from "../models/attendanceModel.js";
import Witness from "../models/witnessModel.js";

// GET /api/dashboard/stats
export const getStats = async (req, res, next) => {
  try {
    const [totalCases, totalWitnesses] = await Promise.all([
      Case.countDocuments(),
      Witness.countDocuments(),
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const hearingsToday = await Case.countDocuments({
      nextHearingDate: { $gte: today, $lt: tomorrow },
    });

    const attendanceToday = await Attendance.countDocuments({
      hearingDate: { $gte: today, $lt: tomorrow },
      status: "present",
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, {
          totalCases,
          totalWitnesses,
          hearingsToday,
          attendanceToday,
        })
      );
  } catch (error) {
    console.error(error);
    next(new ApiError(500, "Failed to fetch dashboard stats"));
  }
};

// GET /api/dashboard/recent-cases?limit=10
export const getRecentCases = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const items = await Case.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('investigatingOfficer', 'name email')
      .populate('liaisonOfficer', 'name email')
      .lean();
    return res.status(200).json(new ApiResponse(200, items));
  } catch (error) {
    console.error(error);
    next(new ApiError(500, "Failed to fetch recent cases"));
  }
};
