const express = require("express");
const {
  createProductController,
  getProductController,
  getAllProductsController,
} = require("../controllers/productController");
const router = express.Router();

router.post("/", createProductController);
router.get("/:id", getProductController);
router.get("/", getAllProductsController);

module.exports = router;
