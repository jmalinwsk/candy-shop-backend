const nodemailer = require("nodemailer");
const asyncHandler = require("express-async-handler");

const sendEmail = asyncHandler(async (data, req, res) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.MAIL_ID,
      pass: process.env.MAIL_PASSWORD,
    },
  });
  let info = await transporter.sendMail({
    from: "Candy Shop",
    to: data.to,
    subject: data.subject,
    text: data.text,
    html: data.html,
  });
  console.log("Message sent: %s", info.messageId);
});

module.exports = sendEmail;
