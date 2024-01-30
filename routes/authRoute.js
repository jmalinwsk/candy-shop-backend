const express = require("express");
const {
  createUserController,
  loginUserController,
  getUsersController,
  getUserController,
  deleteUserController,
  updateUserController,
  blockUserController,
  unblockUserController,
  handleRefreshToken,
} = require("../controllers/userController");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/register", createUserController);
router.post("/login", loginUserController);
router.get("/all-users", getUsersController);
router.get("/refresh", handleRefreshToken);
router.get("/:id", authMiddleware, isAdmin, getUserController);
router.delete("/:id", deleteUserController);
router.put("/edit-user", authMiddleware, updateUserController);
router.put("/block-user/:id", authMiddleware, isAdmin, blockUserController);
router.put("/unblock-user/:id", authMiddleware, isAdmin, unblockUserController);

module.exports = router;
