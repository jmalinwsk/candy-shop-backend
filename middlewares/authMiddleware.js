const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;
  if (req?.headers?.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
    try {
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded?.id);
        req.user = user;
        next();
      }
    } catch (err) {
      throw new Error("Not authorized - token expired. Please log in again.");
    }
  } else {
    throw new Error("No token attached to the header!");
  }
});

const isAdmin = asyncHandler(async (req, res, next) => {
  const { email } = req.user;
  const adminUser = await User.findOne({ email });
  if (adminUser.role == "admin") {
    next();
  } else {
    throw new Error("You are not an admin!");
  }
});

module.exports = { authMiddleware, isAdmin };
