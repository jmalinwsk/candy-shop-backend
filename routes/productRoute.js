const express = require("express");
const { createProductController } = require("../controllers/productController");
const router = express.Router();

router.post("/", createProductController);

module.exports = router;