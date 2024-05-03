const express = require("express");
const {
  createUser,
  loginUser,
  getUsers,
  getUser,
  deleteUser,
  updateUser,
  blockUser,
  unblockUser,
  handleRefreshToken,
  logoutUser,
  updatePassword,
  forgotPasswordToken,
  resetPassword,
  loginAdmin,
  getWishlist,
  saveAddress,
  userCart,
  getUserCart,
  emptyCart,
  applyCoupon,
  createOrder,
  getUserOrders,
  updateOrderStatus,
  removeProductFromCart,
} = require("../controllers/userController");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/register", createUser);
router.put("/password", authMiddleware, updatePassword);
router.post("/forgot-password", forgotPasswordToken);
router.put("/reset-password/:token", resetPassword);
router.put(
  "/update-order-status/:id",
  authMiddleware,
  isAdmin,
  updateOrderStatus,
);
router.post("/login", loginUser);
router.post("/login-admin", loginAdmin);
router.post("/cart", authMiddleware, userCart);
router.post("/cart/apply-coupon", authMiddleware, applyCoupon);
router.post("/cart/create-order", authMiddleware, createOrder);
router.get("/all-users", getUsers);
router.get("/get-orders", authMiddleware, getUserOrders);
router.get("/refresh", handleRefreshToken);
router.get("/logout", logoutUser);
router.get("/wishlist", authMiddleware, getWishlist);
router.get("/cart", authMiddleware, getUserCart);
router.get("/:id", authMiddleware, isAdmin, getUser);
router.delete("/remove-from-cart", authMiddleware, removeProductFromCart);
router.delete("/empty-cart", authMiddleware, emptyCart);
router.delete("/:id", deleteUser);
router.put("/edit-user", authMiddleware, updateUser);
router.put("/save-address", authMiddleware, saveAddress);
router.put("/block-user/:id", authMiddleware, isAdmin, blockUser);
router.put("/unblock-user/:id", authMiddleware, isAdmin, unblockUser);

module.exports = router;
