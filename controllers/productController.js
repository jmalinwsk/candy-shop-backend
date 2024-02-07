const Product = require("../models/productModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");

const createProduct = asyncHandler(async (req, res) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const newProduct = await Product.create(req.body);
    res.json(newProduct);
  } catch (err) {
    throw new Error(err);
  }
});
const getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    res.json(product);
  } catch (err) {
    throw new Error(err);
  }
});
const getProducts = asyncHandler(async (req, res) => {
  try {
    // filtering
    const queryObj = { ...req.query };
    const excludeFields = ["page", "sort", "limit", "fields"];
    excludeFields.forEach((item) => delete queryObj[item]);
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    let query = Product.find(JSON.parse(queryStr));
    // sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }
    // limiting fields
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }
    // pagination
    const page = req.query.page;
    const limit = req.query.limit;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
    if (req.query.page) {
      const productCount = await Product.countDocuments();
      if (skip >= productCount) throw new Error("This page does not exists!");
    }
    const products = await query;
    res.json(products);
  } catch (err) {
    throw new Error(err);
  }
});
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (req.body.title) {
    req.body.slug = slugify(req.body.title);
  }
  try {
    const product = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(product);
  } catch (err) {
    throw new Error(err);
  }
});
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findByIdAndDelete(id);
    res.json(product);
  } catch (err) {
    throw new Error(err);
  }
});
const addOrRemoveFromWishlist = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { productId } = req.body;
  try {
    const user = await User.findById(_id);
    const alreadyAdded = user.wishlist.find((id) => {
      return id.toString() === productId;
    });
    if (alreadyAdded) {
      let user = await User.findByIdAndUpdate(
        _id,
        {
          $pull: { wishlist: productId },
        },
        {
          new: true,
        },
      );
      res.json(user);
    } else {
      let user = await User.findByIdAndUpdate(
        _id,
        {
          $push: { wishlist: productId },
        },
        {
          new: true,
        },
      );
      res.json(user);
    }
  } catch (err) {
    throw new Error(err);
  }
});
const rating = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { star, productId } = req.body;
  try {
    const product = await Product.findById(productId);
    let alreadyRated = product.ratings.find((userId) => {
      return userId.postedby.toString() === _id.toString();
    });
    if (alreadyRated) {
      const product = await Product.updateOne(
        {
          ratings: { $elemMatch: alreadyRated },
        },
        {
          $set: { "ratings.$.star": star },
        },
        {
          new: true,
        },
      );
      res.json(product);
    } else {
      const product = await Product.findByIdAndUpdate(
        productId,
        {
          $push: {
            ratings: {
              star: star,
              postedby: _id,
            },
          },
        },
        {
          new: true,
        },
      );
      res.json(product);
    }
  } catch (err) {
    throw new Error(err);
  }
});

module.exports = {
  createProduct,
  getProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  addOrRemoveFromWishlist,
  rating,
};
