import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import Settings from "../models/settingsModel.js";

// GET /api/settings/:key
export const getSetting = async (req, res, next) => {
  try {
    const { key } = req.params;
    const setting = await Settings.findOne({ key });
    if (!setting) {
      return next(new ApiError(404, "Setting not found"));
    }
    return res.status(200).json(new ApiResponse(200, setting));
  } catch (error) {
    console.error(error);
    next(new ApiError(500, "Failed to fetch setting"));
  }
};

// PUT /api/settings/:key
export const updateSetting = async (req, res, next) => {
  try {
    const { key } = req.params;
    const value = req.body?.value;
    if (typeof value === "undefined") {
      return next(new ApiError(400, "value is required"));
    }
    const updated = await Settings.findOneAndUpdate(
      { key },
      { value, updatedBy: req.userId },
      { new: true, upsert: true }
    );
    return res.status(200).json(new ApiResponse(200, updated));
  } catch (error) {
    console.error(error);
    next(new ApiError(500, "Failed to update setting"));
  }
};
