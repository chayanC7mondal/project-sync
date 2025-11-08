import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import Witness from "../models/witnessModel.js";

// GET /api/witnesses
export const getWitnesses = async (req, res, next) => {
  try {
  const witnesses = await Witness.find().sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, witnesses));
  } catch (error) {
    console.error(error);
    next(new ApiError(500, "Failed to fetch witnesses"));
  }
};

// GET /api/witnesses/:id
export const getWitnessById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await Witness.findById(id);
    if (!data) {
      return next(new ApiError(404, "Witness not found"));
    }
    return res.status(200).json(new ApiResponse(200, data));
  } catch (error) {
    console.error(error);
    next(new ApiError(500, "Failed to fetch witness"));
  }
};

// POST /api/witnesses
export const createWitness = async (req, res, next) => {
  try {
    const { witnessId, name, age, gender, phone } = req.body || {};
    if (!witnessId || !name || !age || !gender || !phone) {
      return next(new ApiError(400, "witnessId, name, age, gender and phone are required"));
    }
  const created = await Witness.create(req.body);
  return res.status(201).json(new ApiResponse(201, created));
  } catch (error) {
    console.error(error);
    next(new ApiError(500, "Failed to create witness"));
  }
};

// PUT /api/witnesses/:id
export const updateWitness = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await Witness.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) {
      return next(new ApiError(404, "Witness not found"));
    }
    return res.status(200).json(new ApiResponse(200, updated));
  } catch (error) {
    console.error(error);
    next(new ApiError(500, "Failed to update witness"));
  }
};
