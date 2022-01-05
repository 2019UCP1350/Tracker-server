const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.guser,
    pass: process.env.gpass,
  },
});

const sendemail = async (email) => {
  try {
    const otp = Math.floor(Math.random() * 1000000);
    var mailoptions = {
      from: "Tracker@gmail.com",
      to: email,
      subject: "Email verification",
      html:
        "<p>Hi <br> OTP for email verification is: <br>" +
        otp.toString() +
        "<br> <font color='red'> OTP is valid from 60 seconds </font> </p>",
    };
    transporter.sendMail(mailoptions, function (error, info) {
      if (error) {
        console.log("Error from sending email", error);
      } else {
        console.log("Email sent" , info);
      }
    });
    return otp.toString();
  } catch (e) {
    console.log("error sending email");
  }
};

module.exports = sendemail;
