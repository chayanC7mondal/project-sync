import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import Auth from "../models/authModel.js";

// GET /api/user/theme-preference
export const getThemePreference = async (req, res, next) => {
  try {
    if (!req.userId) {
      return next(new ApiError(401, "Unauthorized"));
    }
    const user = await Auth.findById(req.userId);
    if (!user) {
      return next(new ApiError(404, "User not found"));
    }
  return res.status(200).json(new ApiResponse(200, { theme: user.themePreference || "system" }));
  } catch (error) {
    console.error(error);
    next(new ApiError(500, "Failed to fetch theme preference"));
  }
};

// POST /api/user/theme-preference
export const saveThemePreference = async (req, res, next) => {
  try {
    if (!req.userId) {
      return next(new ApiError(401, "Unauthorized"));
    }
    const { theme } = req.body || {};
    if (!theme || !["light", "dark", "system"].includes(theme)) {
      return next(new ApiError(400, "Invalid theme value"));
    }
    const updated = await Auth.findByIdAndUpdate(
      req.userId,
      { themePreference: theme },
      { new: true }
    );
    if (!updated) {
      return next(new ApiError(404, "User not found"));
    }
  return res.status(200).json(new ApiResponse(200, null, "Theme preference saved"));
  } catch (error) {
    console.error(error);
    next(new ApiError(500, "Failed to save theme preference"));
  }
};
