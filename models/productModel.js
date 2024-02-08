const mongoose = require("mongoose");

var productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      select: false,
    },
    images: {
      type: Array,
    },
    ratings: [
      {
        star: Number,
        comment: String,
        postedby: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    averageRating: {
      type: String,
      default: 0,
    },
    sold: {
      type: Number,
      default: 0,
      select: false,
    },
  },
  {
    timestamps: true,
  },
);

//Export the model
module.exports = mongoose.model("Product", productSchema);
