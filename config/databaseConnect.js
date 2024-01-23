const { default: mongoose } = require("mongoose");

const databaseConnect = () => {
  try {
    const conn = mongoose.connect("mongodb://localhost:27017");
    console.log("Database connected successfully!");
  } catch (err) {
    console.log("Database error:");
    throw new Error();
  }
};
module.exports = databaseConnect;
