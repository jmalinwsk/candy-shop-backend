const User = require("../models/userModel");
const { generateToken } = require("../configs/jwtToken");
const asyncHandler = require("express-async-handler");
const validateMongoDBID = require("../utils/validateMongoDBID");
const { generateRefreshToken } = require("../configs/refreshToken");
const jwt = require("jsonwebtoken");

const createUserController = asyncHandler(async (req, res) => {
  const email = req.body.email;
  const findUser = await User.findOne({ email: email });
  if (!findUser) {
    const newUser = await User.create(req.body);
    res.json(newUser);
  } else {
    throw new Error("User already exists!");
  }
});
const loginUserController = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const findUser = await User.findOne({ email });
  if (findUser && (await findUser.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(findUser?._id);
    const updateUser = await User.findOneAndUpdate(
      findUser._id,
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
      _id: findUser?._id,
      email: findUser?.email,
      token: generateToken(findUser?._id),
    });
  } else {
    throw new Error("Invalid credentials!");
  }
});
const logoutUserController = asyncHandler(async (req, res) => {
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
const updateUserController = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDBID(_id);
  try {
    const updateUser = await User.findByIdAndUpdate(
      _id,
      {
        email: req?.body.email,
      },
      {
        new: true,
      },
    );
    res.json(updateUser);
  } catch (err) {
    throw new Error(err);
  }
});
const getUsersController = asyncHandler(async (req, res) => {
  try {
    const getUsers = await User.find();
    res.json(getUsers);
  } catch (err) {
    throw new Error(err);
  }
});
const getUserController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBID(id);
  try {
    const getUser = await User.findById(id);
    res.json({ getUser });
  } catch (err) {
    throw new Error(err);
  }
});
const deleteUserController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBID(id);
  try {
    const deleteUser = await User.findByIdAndDelete(id);
    res.json({ deleteUser });
  } catch (err) {
    throw new Error(err);
  }
});
const blockUserController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBID(id);
  try {
    const blockUser = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: true,
      },
      {
        new: true,
      },
    );
    res.json(blockUser);
  } catch (err) {
    throw new Error(err);
  }
});
const unblockUserController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBID(id);
  try {
    const unblockUser = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: false,
      },
      {
        new: true,
      },
    );
    res.json(unblockUser);
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

module.exports = {
  createUserController,
  loginUserController,
  logoutUserController,
  getUsersController,
  getUserController,
  deleteUserController,
  updateUserController,
  blockUserController,
  unblockUserController,
  handleRefreshToken,
};
