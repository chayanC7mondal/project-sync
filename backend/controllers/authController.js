import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import Auth from "../models/authModel.js";

// Cookie max age (3 days)
const maxAgeMs = 3 * 24 * 60 * 60 * 1000;

// Helper: issue JWT payload with id + role
function signToken(user) {
  return jwt.sign(
    { id: user._id.toString(), role: user.role, email: user.email },
    process.env.JWT_KEY,
    { expiresIn: Math.floor(maxAgeMs / 1000) }
  );
}

// POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, phone, username, password } = req.body || {};
    if (!password || (!email && !phone && !username)) {
      return next(new ApiError(400, "Password and one of email/phone/username required"));
    }

    const query = email ? { email } : phone ? { phone } : { username };
    const user = await Auth.findOne(query);
    if (!user) {
      return next(new ApiError(404, "User not found"));
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return next(new ApiError(401, "Invalid credentials"));
    }

    const token = signToken(user);
    // Set httpOnly cookie (frontend may also read token if we choose to return it)
    res.cookie("jwt", token, {
      maxAge: maxAgeMs,
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    return res.status(200).json(
      new ApiResponse(200, {
        token, // optional if frontend wants to store it; cookie handles auth too
        user: {
          id: user._id,
          email: user.email,
          phone: user.phone,
          username: user.username,
          role: user.role,
          themePreference: user.themePreference || "system",
        },
      })
    );
  } catch (error) {
    console.error(error);
    next(new ApiError(500, "Login failed"));
  }
};

// POST /api/auth/logout
export const logout = async (req, res, next) => {
  try {
    res.cookie("jwt", "", { maxAge: 1, secure: true, sameSite: "None" });
  return res.status(200).json(new ApiResponse(200, null, "Logged out"));
  } catch (error) {
    console.error(error);
    next(new ApiError(500, "Logout failed"));
  }
};

// GET /api/auth/validate
export const validateToken = async (req, res, next) => {
  try {
    const token = req.cookies?.jwt;
    if (!token) {
      return res.status(200).json(new ApiResponse(200, { valid: false }));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_KEY);
      return res
        .status(200)
        .json(new ApiResponse(200, { valid: true, userId: decoded.id, role: decoded.role }));
    } catch {
      return res.status(200).json(new ApiResponse(200, { valid: false }));
    }
  } catch (error) {
    console.error(error);
    next(new ApiError(500, "Token validation failed"));
  }
};
