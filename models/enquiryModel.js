const mongoose = require("mongoose");

var enquirySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "submitted",
    enum: ["submitted", "contacted", "in progress", "resolved"],
  },
});

module.exports = mongoose.model("Enquiry", enquirySchema);
