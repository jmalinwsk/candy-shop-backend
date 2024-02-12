const express = require("express");
const {
  createProduct,
  getProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  addOrRemoveFromWishlist,
  rating,
  uploadImages,
} = require("../controllers/productController");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const { uploadImage, imageResize } = require("../middlewares/uploadImages");
const router = express.Router();

router.post("/", authMiddleware, isAdmin, createProduct);
router.put(
  "/upload-images/:id",
  authMiddleware,
  isAdmin,
  uploadImage.array("image", 10),
  imageResize,
  uploadImages,
);
router.get("/:id", getProduct);
router.get("/", getProducts);
router.put("/wishlist", authMiddleware, addOrRemoveFromWishlist);
router.put("/rating", authMiddleware, rating);
router.delete("/:id", authMiddleware, isAdmin, deleteProduct);
router.put("/:id", authMiddleware, isAdmin, updateProduct);

module.exports = router;
