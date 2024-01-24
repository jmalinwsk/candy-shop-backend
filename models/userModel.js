const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
var userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "user",
  }
});

userSchema.pre("save", async function(next) {
  const salt = bcrypt.genSaltSync(saltRounds);
  this.password = bcrypt.hashSync(this.password, salt);
});
userSchema.methods.isPasswordMatched = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
