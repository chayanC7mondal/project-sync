import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import Attendance from "../models/attendanceModel.js";

// GET /api/attendance/today
export const getTodayAttendance = async (req, res, next) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const records = await Attendance.find({
      hearingDate: { $gte: start, $lt: end },
    })
      .sort({ createdAt: -1 });
    return res.status(200).json(new ApiResponse(200, records));
  } catch (error) {
    console.error(error);
    next(new ApiError(500, "Failed to fetch today's attendance"));
  }
};

// POST /api/attendance
export const markAttendance = async (req, res, next) => {
  try {
    const { caseId, officerId, status, timestamp, hearingDate, hearingTime, courtName, latitude, longitude, remarks } = req.body || {};

    if (!caseId || !officerId || !status) {
      return next(new ApiError(400, "caseId, officerId and status are required"));
    }

    const record = await Attendance.create({
      caseId,
      officer: officerId,
      status,
      hearingDate: hearingDate ? new Date(hearingDate) : undefined,
      hearingTime,
      courtName,
      arrivalTime: timestamp ? new Date(timestamp) : undefined,
      latitude,
      longitude,
      remarks,
      markedBy: req.userId || undefined,
    });

  return res.status(201).json(new ApiResponse(201, record));
  } catch (error) {
    console.error(error);
    next(new ApiError(500, "Failed to mark attendance"));
  }
};

// GET /api/attendance/report?startDate=..&endDate=..&officerId=..
export const getAttendanceReport = async (req, res, next) => {
  try {
    const { startDate, endDate, officerId } = req.query;
    if (!startDate || !endDate) {
      return next(new ApiError(400, "startDate and endDate are required"));
    }

    const query = {
      hearingDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    };
    if (officerId) query.officer = officerId;

  const records = await Attendance.find(query).sort({ hearingDate: 1 });
  return res.status(200).json(new ApiResponse(200, records));
  } catch (error) {
    console.error(error);
    next(new ApiError(500, "Failed to fetch attendance report"));
  }
};
