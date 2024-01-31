const mongoose = require("mongoose");

var productSchema = new mongoose.Schema({
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
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  brand: {
    type: String,
    enum: ["Haribo", "Kinder"],
  },
  quantity: {
    type: Number,
    required: true,
  },
  images: {
    type: Array,
  },
  ratings: [
    {
      star: Number,
      postedby: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
  ],
  sold: {
    type: Number,
    default: 0,
  },
});

//Export the model
module.exports = mongoose.model("Product", productSchema);
