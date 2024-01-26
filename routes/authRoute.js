const express = require("express");
const {
  createUserController,
  loginUserController,
  getUsersController,
  getUserController,
  deleteUserController,
  updateUserController,
} = require("../controllers/userController");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/register", createUserController);
router.post("/login", loginUserController);
router.get("/all-users", getUsersController);
router.get("/:id", authMiddleware, isAdmin, getUserController);
router.delete("/:id", deleteUserController);
router.put("/edit-user", authMiddleware, updateUserController);

module.exports = router;
