const express = require("express");
const {
  createUserController,
  loginUserController,
  getUsersController,
  getUserController,
  deleteUserController,
  updateUserController,
} = require("../controllers/userController");
const router = express.Router();

router.post("/register", createUserController);
router.post("/login", loginUserController);
router.get("/all-users", getUsersController);
router.get("/:id", getUserController);
router.delete("/:id", deleteUserController);
router.put("/:id", updateUserController);

module.exports = router;
