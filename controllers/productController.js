const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");

const createProductController = asyncHandler(async (req, res) => {
  try {
    if(req.body.title) {
        req.body.slug = slugify(req.body.title);
    }
    const newProduct = await Product.create(req.body);
    res.json(newProduct);
  } catch (err) {
    throw new Error(err);
  }
});
const getProductController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const getProduct = await Product.findById(id);
    res.json(getProduct);
  } catch (err) {
    throw new Error(err);
  }
});
const getAllProductsController = asyncHandler(async (req, res) => {
  try {
    const getProducts = await Product.find();
    res.json(getProducts);
  } catch (err) {
    throw new Error(err);
  }
});

module.exports = {
  createProductController,
  getProductController,
  getAllProductsController,
};
