import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.cookies?.jwt;
  if (!token) {
    console.log("JWT cookie not found");
    return res.status(401).send("You are not authenticated!");
  }

  jwt.verify(token, process.env.JWT_KEY, (err, payload) => {
    if (err) {
      console.log("JWT verification failed", err);
      return res.status(403).send("Token is not valid!");
    }
    req.userId = payload.id;
    req.userRole = payload.role;
    next();
  });
};

export const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.userRole) {
      return res.status(403).json({
        success: false,
        message: "Access denied. No role found.",
      });
    }

    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Insufficient permissions.",
      });
    }

    next();
  };
};
