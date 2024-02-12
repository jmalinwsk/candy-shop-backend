const User = require("../models/userModel");
const { generateToken } = require("../configs/jwtToken");
const asyncHandler = require("express-async-handler");
const validateMongoDBID = require("../utils/validateMongoDBID");
const { generateRefreshToken } = require("../configs/refreshToken");
const jwt = require("jsonwebtoken");
const sendEmail = require("./emailController");
const crypto = require("crypto");

const createUser = asyncHandler(async (req, res) => {
  const email = req.body.email;
  const user = await User.findOne({ email: email });
  if (!user) {
    const newUser = await User.create(req.body);
    res.json(newUser);
  } else {
    throw new Error("User already exists!");
  }
});
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && (await user.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(user?._id);
    const updateUser = await User.findOneAndUpdate(
      user._id,
      {
        refreshToken: refreshToken,
      },
      {
        new: true,
      },
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 168 * 60 * 60 * 1000,
    });
    res.json({
      _id: user?._id,
      email: user?.email,
      token: generateToken(user?._id),
    });
  } else {
    throw new Error("Invalid credentials!");
  }
});
const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const admin = await User.findOne({ email });
  if(admin.role !== "admin") throw new Error("User not authorized!");
  if (admin && (await admin.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(admin?._id);
    const updateUser = await User.findOneAndUpdate(
      admin._id,
      {
        refreshToken: refreshToken,
      },
      {
        new: true,
      },
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 168 * 60 * 60 * 1000,
    });
    res.json({
      _id: admin?._id,
      email: admin?.email,
      token: generateToken(admin?._id),
    });
  } else {
    throw new Error("Invalid credentials!");
  }
});
const logoutUser = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No refresh token in cookies!");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });
    return res.sendStatus(403);
  }
  await User.findOneAndUpdate(
    { refreshToken },
    {
      refreshToken: "",
    },
  );
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });
  res.sendStatus(204);
});
const updateUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDBID(_id);
  try {
    const user = await User.findByIdAndUpdate(
      _id,
      {
        email: req?.body.email,
      },
      {
        new: true,
      },
    );
    res.json(user);
  } catch (err) {
    throw new Error(err);
  }
});
const saveAddress = asyncHandler(async (req, res, next) => {
  const { _id} = req.user;
  validateMongoDBID(_id);
  try {
    const user = await User.findByIdAndUpdate(_id, {
      address: req?.body?.address,
    }, {
      new: true,
    });
    res.json(user);
  } catch (err) {
    throw new Error(err);
  }
})
const getUsers = asyncHandler(async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    throw new Error(err);
  }
});
const getUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBID(id);
  try {
    const user = await User.findById(id);
    res.json({ user });
  } catch (err) {
    throw new Error(err);
  }
});
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBID(id);
  try {
    const user = await User.findByIdAndDelete(id);
    res.json({ user });
  } catch (err) {
    throw new Error(err);
  }
});
const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBID(id);
  try {
    const user = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: true,
      },
      {
        new: true,
      },
    );
    res.json(user);
  } catch (err) {
    throw new Error(err);
  }
});
const unblockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBID(id);
  try {
    const user = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: false,
      },
      {
        new: true,
      },
    );
    res.json(user);
  } catch (err) {
    throw new Error(err);
  }
});
const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No refresh token in cookies!");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user)
    throw new Error("No refresh token presented in database or not matched!");
  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err || user.id != decoded.id)
      throw new Error("There is something wrong with the refresh token!");
    const accessToken = generateToken(user?._id);
    res.json({ accessToken });
  });
});
const updatePassword = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { password } = req.body;
  validateMongoDBID(_id);
  const user = await User.findById(_id);
  if (password) {
    user.password = password;
    const newPassword = await user.save();
    res.json(newPassword);
  } else {
    res.json(user);
  }
});
const forgotPasswordToken = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found with this email!");
  try {
    const token = await user.createPasswordResetToken();
    await user.save();
    const resetURL = `Hello, please follow this link to reset a password (this link is valid for 10 minutes): <a href='http://localhost:${process.env.PORT}/api/user/reset-password/${token}'>Here's the link</a>`;
    const data = {
      to: email,
      text: "Hello user!",
      subject: "Forgot password link",
      html: resetURL,
    };
    sendEmail(data);
    res.json(token);
  } catch (err) {
    throw new Error(err);
  }
});
const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) throw new Error("Token expired!");
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  res.json(user);
});
const getWishlist = asyncHandler(async (req,res) => {
  const { _id} = req.user;
  try {
    const user = await User.findById(_id).populate("wishlist");
    res.json(user);
  } catch(err) {
    throw new Error(err);
  }
})

module.exports = {
  createUser,
  loginUser,
  loginAdmin,
  logoutUser,
  getUsers,
  getUser,
  deleteUser,
  updateUser,
  saveAddress,
  blockUser,
  unblockUser,
  handleRefreshToken,
  updatePassword,
  forgotPasswordToken,
  resetPassword,
  getWishlist
};
