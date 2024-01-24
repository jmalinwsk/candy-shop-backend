const express = require("express");
const databaseConnect = require("./config/databaseConnect");
const app = express();
const dotenv = require("dotenv").config();
const PORT = process.env.PORT || 4000;
const authRouter = require("./routes/authRoute");
const bodyParser = require("body-parser");

databaseConnect();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/api/user", authRouter);
app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});
