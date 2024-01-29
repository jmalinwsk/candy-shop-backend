const User = require("../models/userModel");
const { generateToken } = require("../configs/jwtToken");
const asyncHandler = require("express-async-handler");
const validateMongoDBID = require("../utils/validateMongoDBID");
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
    res.json({
      _id: findUser?._id,
      email: findUser?.email,
      token: generateToken(findUser?._id),
    });
  } else {
    throw new Error("Invalid credentials!");
  }
});
const updateUserController = asyncHandler(async (req, res) => {
  const { id } = req.user;
  validateMongoDBID(id);
  try {
    const updateUser = await User.findByIdAndUpdate(
      id,
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

module.exports = {
  createUserController,
  loginUserController,
  getUsersController,
  getUserController,
  deleteUserController,
  updateUserController,
  blockUserController,
  unblockUserController,
};
