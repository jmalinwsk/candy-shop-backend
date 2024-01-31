const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");

const createProductController = asyncHandler(async (req, res) => {
    try {
        const newProduct = await Product.create(req.body);
        res.json(newProduct);
    } catch (err) {
        throw new Error(err);
    }
});

module.exports = {createProductController};