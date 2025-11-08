import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import Settings from "../models/settingsModel.js";

// GET /api/admin/system-theme
export const getSystemTheme = async (req, res, next) => {
  try {
    const setting = await Settings.findOne({ key: "system_theme" });
    const theme = setting?.value?.theme || "system";
  return res.status(200).json(new ApiResponse(200, { theme }));
  } catch (error) {
    console.error(error);
    next(new ApiError(500, "Failed to fetch system theme"));
  }
};

// POST /api/admin/system-theme
export const setSystemTheme = async (req, res, next) => {
  try {
    const { theme } = req.body || {};
    if (!theme || !["light", "dark", "system"].includes(theme)) {
      return next(new ApiError(400, "Invalid theme value"));
    }
    const updated = await Settings.findOneAndUpdate(
      { key: "system_theme" },
      { value: { theme }, updatedBy: req.userId },
      { upsert: true, new: true }
    );
  return res.status(200).json(new ApiResponse(200, { theme: updated.value.theme }));
  } catch (error) {
    console.error(error);
    next(new ApiError(500, "Failed to set system theme"));
  }
};
