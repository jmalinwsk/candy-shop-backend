const express = require("express");
const {
  createProduct,
  getProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  addOrRemoveFromWishlist,
} = require("../controllers/productController");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/", authMiddleware, isAdmin, createProduct);
router.get("/:id", getProduct);
router.get("/", getProducts);
router.put("/wishlist", authMiddleware, addOrRemoveFromWishlist);
router.delete("/:id", authMiddleware, isAdmin, deleteProduct);
router.put("/:id", authMiddleware, isAdmin, updateProduct);

module.exports = router;
