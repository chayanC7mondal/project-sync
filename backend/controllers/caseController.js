import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import Case from "../models/caseModel.js";

// GET /api/cases
export const getCases = async (req, res, next) => {
  try {
  const cases = await Case.find().sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, cases));
  } catch (error) {
    console.error(error);
    next(new ApiError(500, "Failed to fetch cases"));
  }
};

// GET /api/cases/:id
export const getCaseById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const caseDoc = await Case.findById(id);
    if (!caseDoc) {
      return next(new ApiError(404, "Case not found"));
    }
    return res.status(200).json(new ApiResponse(200, caseDoc));
  } catch (error) {
    console.error(error);
    next(new ApiError(500, "Failed to fetch case details"));
  }
};

// POST /api/cases
export const createCase = async (req, res, next) => {
  try {
    const data = req.body || {};
    if (!data.caseId || !data.firNumber || !data.policeStation) {
      return next(new ApiError(400, "caseId, firNumber and policeStation are required"));
    }
    const created = await Case.create({
      caseId: data.caseId,
      firNumber: data.firNumber,
      firDate: data.firDate,
      policeStation: data.policeStation,
      sections: data.sections || [],
      courtName: data.courtName,
      investigatingOfficer: data.investigatingOfficer,
      witnesses: data.witnesses || [],
      nextHearingDate: data.nextHearingDate,
      hearingTime: data.hearingTime,
      status: data.status,
      attendanceStatus: data.attendanceStatus,
    });
  return res.status(201).json(new ApiResponse(201, created));
  } catch (error) {
    console.error(error);
    next(new ApiError(500, "Failed to create case"));
  }
};

// PUT /api/cases/:id
export const updateCase = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await Case.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) {
      return next(new ApiError(404, "Case not found"));
    }
    return res.status(200).json(new ApiResponse(200, updated));
  } catch (error) {
    console.error(error);
    next(new ApiError(500, "Failed to update case"));
  }
};
