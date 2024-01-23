const express = require("express");
const databaseConnect = require("./config/databaseConnect");
const app = express();
const dotenv = require("dotenv").config();
const PORT = process.env.PORT || 4000;

databaseConnect();
app.use("/", (req, res) => {
  res.send("Hello world!");
});
app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});
