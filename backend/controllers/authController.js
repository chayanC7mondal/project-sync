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

// POST /api/auth/signup
export const signup = async (req, res, next) => {
  try {
    const { 
      employeeId, 
      username, 
      email, 
      phone, 
      password, 
      role,
      rank,
      department,
      station
    } = req.body || {};

    // Validate required fields
    if (!employeeId || !username || !email || !phone || !password || !role) {
      return next(new ApiError(400, "All required fields must be provided"));
    }

    // Validate role
    const validRoles = ["admin", "io", "liaison", "witness"];
    if (!validRoles.includes(role)) {
      return next(new ApiError(400, "Invalid role specified"));
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return next(new ApiError(400, "Invalid email format"));
    }

    // Validate phone format (basic)
    if (phone.length < 10) {
      return next(new ApiError(400, "Phone number must be at least 10 digits"));
    }

    // Validate password strength
    if (password.length < 6) {
      return next(new ApiError(400, "Password must be at least 6 characters long"));
    }

    // Check if user already exists
    const existingUser = await Auth.findOne({
      $or: [
        { employeeId },
        { email },
        { username },
        { phone }
      ]
    });

    if (existingUser) {
      if (existingUser.employeeId === employeeId) {
        return next(new ApiError(409, "Employee ID already exists"));
      }
      if (existingUser.email === email) {
        return next(new ApiError(409, "Email already registered"));
      }
      if (existingUser.username === username) {
        return next(new ApiError(409, "Username already taken"));
      }
      if (existingUser.phone === phone) {
        return next(new ApiError(409, "Phone number already registered"));
      }
    }

    // Create new user
    const newUser = new Auth({
      employeeId,
      username,
      email,
      phone,
      password, // Will be hashed by the pre-save hook
      role,
      rank: rank || undefined,
      department: department || undefined,
      station: station || undefined,
      isActive: true,
      themePreference: "system"
    });

    await newUser.save();

    // Generate token and log user in automatically
    const token = signToken(newUser);
    res.cookie("jwt", token, {
      maxAge: maxAgeMs,
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    return res.status(201).json(
      new ApiResponse(201, {
        token,
        user: {
          id: newUser._id,
          employeeId: newUser.employeeId,
          email: newUser.email,
          phone: newUser.phone,
          username: newUser.username,
          role: newUser.role,
          rank: newUser.rank,
          department: newUser.department,
          station: newUser.station,
          themePreference: newUser.themePreference,
        },
      }, "Registration successful")
    );
  } catch (error) {
    console.error("Signup error:", error);
    next(new ApiError(500, "Registration failed. Please try again."));
  }
};
