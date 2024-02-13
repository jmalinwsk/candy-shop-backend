const User = require("../models/userModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Coupon = require("../models/couponModel");
const Order = require("../models/orderModel");
const { generateToken } = require("../configs/jwtToken");
const asyncHandler = require("express-async-handler");
const validateMongoDBID = require("../utils/validateMongoDBID");
const { generateRefreshToken } = require("../configs/refreshToken");
const jwt = require("jsonwebtoken");
const sendEmail = require("./emailController");
const crypto = require("crypto");
const uniqid = require("uniqid");

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
  if (admin.role !== "admin") throw new Error("User not authorized!");
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
  const { _id } = req.user;
  validateMongoDBID(_id);
  try {
    const user = await User.findByIdAndUpdate(
      _id,
      {
        address: req?.body?.address,
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

const getWishlist = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  try {
    const user = await User.findById(_id).populate("wishlist");
    res.json(user);
  } catch (err) {
    throw new Error(err);
  }
});

const userCart = asyncHandler(async (req, res) => {
  const { cart } = req.body;
  const { _id } = req.user;
  validateMongoDBID(_id);
  try {
    let products = [];
    const user = await User.findById(_id);
    const existingCart = await Cart.findOne({ userId: user._id });
    if (existingCart) await Cart.deleteMany({ userId: user._id });
    for (let i = 0; i < cart.length; i++) {
      let obj = {};
      obj.product = cart[i]._id;
      obj.count = cart[i].count;
      let getPrice = await Product.findById(cart[i]._id).select("price").exec();
      obj.price = getPrice.price;
      products.push(obj);
    }
    let totalPrice = 0;
    for (let i = 0; i < products.length; i++) {
      totalPrice += products[i].price * products[i].count;
    }
    let newCart = await new Cart({
      products,
      totalPrice,
      userId: user._id,
    }).save();
    res.json(newCart);
  } catch (err) {
    throw new Error(err);
  }
});

const getUserCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDBID(_id);
  try {
    const cart = await Cart.findOne({ userId: _id }).populate(
      "products.product",
    );
    res.json(cart);
  } catch (err) {
    throw new Error(err);
  }
});

const emptyCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDBID(_id);
  try {
    const user = await User.findOne({ _id });
    const cart = await Cart.findOneAndDelete({ userId: user._id });
    res.json(cart);
  } catch (err) {
    throw new Error(err);
  }
});
const applyCoupon = asyncHandler(async (req, res) => {
  const { coupon } = req.body;
  const { _id } = req.user;
  const validCoupon = await Coupon.findOne({ name: coupon });
  if (validCoupon == null) throw new Error("Invalid coupon!");
  const user = await User.findOne({ _id });
  let { totalPrice } = await Cart.findOne({ userId: user._id }).populate(
    "products.product",
  );
  let totalPriceAfterDiscount =
    totalPrice - ((totalPrice * validCoupon.discount) / 100).toFixed(2);
  await Cart.findOneAndUpdate(
    { userId: user._id },
    {
      totalPriceAfterDiscount: totalPriceAfterDiscount,
    },
    {
      new: true,
    },
  );
  res.json(totalPriceAfterDiscount);
});
const createOrder = asyncHandler(async (req, res) => {
  const { cashOnDelivery, couponApplied } = req.body;
  const { _id } = req.user;
  validateMongoDBID(_id);
  try {
    if (!cashOnDelivery)
      throw new Error("Creating cash on delivery order failed!");
    const user = await User.findById(_id);
    let cart = await Cart.findOne({ userId: user._id });
    let finalPrice = 0;
    if (couponApplied && cart.totalPriceAfterDiscount) {
      finalPrice = cart.totalPriceAfterDiscount;
    } else {
      finalPrice = cart.totalPrice;
    }
    let order = await new Order({
      products: cart.products,
      paymentIntent: {
        id: uniqid(),
        method: "cashOnDelivery",
        price: finalPrice,
        status: "Cash on delivery",
        created: Date.now(),
        currency: "PLN",
      },
      userId: user._id,
      orderStatus: "Cash on delivery",
    }).save();
    const products = await Product.bulkWrite(
      cart.products.map((item) => {
        return {
          updateOne: {
            filter: { _id: item.product._id },
            update: { $inc: { quantity: -item.count, sold: +item.count } },
          },
        };
      }),
      {},
    );
    res.json({ message: "success" });
  } catch (err) {
    throw new Error(err);
  }
});

const getUserOrders = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDBID(_id);
  try {
    const userOrders = await Order.findOne({ userId: _id }).populate(
      "products.product",
    );
    res.json(userOrders);
  } catch (err) {
    throw new Error(err);
  }
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  validateMongoDBID(id);
  try {
    const order = await Order.findByIdAndUpdate(
      id,
      {
        orderStatus: status,
        paymentIntent: {
          status: status,
        },
      },
      {
        new: true,
      },
    );
    res.json(order);
  } catch (err) {
    throw new Error(err);
  }
});

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
  getWishlist,
  userCart,
  getUserCart,
  emptyCart,
  applyCoupon,
  createOrder,
  getUserOrders,
  updateOrderStatus,
};
