const Brand = require("../models/brandModel");
const asyncHandler = require("express-async-handler");
const validateMongoDBID = require("../utils/validateMongoDBID");

const createBrand = asyncHandler(async (req, res) => {
  try {
    const newBrand = await Brand.create(req.body);
    res.json(newBrand);
  } catch (err) {
    throw new Error(err);
  }
});
const updateBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBID(id);
  try {
    const brand = await Brand.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(brand);
  } catch (err) {
    throw new Error(err);
  }
});
const deleteBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBID(id);
  try {
    const brand = await Brand.findOneAndDelete(id);
    res.json(brand);
  } catch (err) {
    throw new Error(err);
  }
});
const getBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBID(id);
  try {
    const brand = await Brand.findById(id);
    res.json(brand);
  } catch (err) {
    throw new Error(err);
  }
});
const getBrands = asyncHandler(async (req, res) => {
  try {
    const Brands = await Brand.find();
    res.json(Brands);
  } catch (err) {
    throw new Error(err);
  }
});

module.exports = {
  createBrand,
  updateBrand,
  deleteBrand,
  getBrand,
  getBrands,
};
