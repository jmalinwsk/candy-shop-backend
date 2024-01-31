const express = require("express");
const {
  createProduct,
  getProduct,
  getAllProducts,
  updateProduct,
} = require("../controllers/productController");
const router = express.Router();

router.post("/", createProduct);
router.get("/:id", getProduct);
router.get("/", getAllProducts);
router.put("/:id", updateProduct);

module.exports = router;
