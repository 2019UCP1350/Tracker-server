const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = mongoose.model("User");
const sendemail = require("./email");
const reqAuth = require("../middlewares/reqAuth");
const router = express.Router();
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
dotenv.config();

router.post("/signup", async (req, res) => {
  // req:request res:response
  try {
    let {password,email,confirmPassword}=req.body;
    email=email.toLowerCase();
    if (!email){
      return res.send({ error: "Must provide an Email." });
    }
    if(!password){
      return res.send({ error: "Must provide an Password." });
    }
    if (password != confirmPassword) {
      return res.send({ error: "Password and Confirm-Password doesnot match." });
    }
    const otp = await sendemail(email);
    const time = parseInt(Date.now() / 1000) + 60;
    const user = new User({
      email: email,
      password:password,
      isEmailVerified: false,
      otp: otp,
      time: time,
    });
    await user.save();
    const token = jwt.sign({ userId: user._id }, process.env.SALT);
    /* this is how u create a javascript token which is a 
		   unique string use to valid a user with in an app or 
			a website 
			first argument is the data of which we want to create a jwt
			seciond argument is the secret key which is used to create a jwt
			and we can retrieve data from jwt using this string
		*/
    res.send({ token, time, email: user.email, username: user.username });
  } catch (err) {
    return res.status(422).send(err.message);
    /* res.status is status of http request 422 is a 
		technical term for error which mean the user has 
		send some invalid information
		err.message is a automatically generate message by mangodb
		*/
  }
});

router.post("/signin", async (req, res) => {
  let { email, password } = req.body;
  email=email.toLowerCase();
  if (!email ) {
    return res.send({ error: "Must provide an Email." });
  }
  if(!password){
    return res.send({ error: "Must provide an Password." });
  }
  const user = await User.findOne({ email });
  if (!user) {
    return res.send({ error: "Email not registered." });
  }
  try {
    const match=await user.comparePassword(password);
    if(!match){
      res.send({error:"Incorrect Password"});
    }
    const token = jwt.sign({ userId: user._id }, process.env.SALT);
    res.send({
      token,
      isEmailVerified: user.isEmailVerified,
      time: user.time,
      username: user.username,
      email: user.email,
    });
  } catch (err) {
    return res.status(422).send({ error: "Invalid email or password" });
  }
});

router.post("/otpverify", async (req, res) => {
  let { otp, email, time } = req.body;
  email=email.toLowerCase();
  try {
    const user = await User.findOne({ email });
    if (user.time - time >= 0) {
      if (user.otp === otp) {
        try {
          if (!user.isEmailVerified) {
            await User.findOneAndUpdate(
              { email: user.email },
              { isEmailVerified: true }
            );
          }
          res.send({ isEmailVerified: true });
        } catch (err) {
          return res
            .status(422)
            .send({ error: "Something went wrong with otp verify" });
        }
      } else {
        res.send({ error: "Incorrect OTP" });
      }
    } else {
      res.send({ error: "OTP Expired" });
    }
  } catch (err) {
    return res
      .status(422)
      .send({ error: "Something went wrong with otp verify" });
  }
});

router.post("/email", reqAuth, async (req, res) => {
  try {
    const otp = await sendemail(req.user.email);
    const time = parseInt(Date.now() / 1000) + 60;
    await User.updateOne({ email: req.user.email }, { otp: otp, time: time });
    res.send({ time });
  } catch (err) {
    return res
      .status(422)
      .send({ error: "Something went wrong with get email" });
  }
});

router.get("/info", reqAuth, (req, res) => {
  try {
    res.send({
      time: req.user.time,
      email: req.user.email,
      username: req.user.username,
      isEmailVerified: req.user.isEmailVerified,
    });
  } catch (err) {
    return res
      .status(422)
      .send({ error: "Something went wrong with get time" });
  }
});

router.delete("/user", reqAuth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.status(204).send({});
  } catch (err) {
    return res.status(422).send({ error: "Error deleting user" });
  }
});

router.post("/usercheck", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email.toLowerCase() });
    if (!user) {
      res.send({ error: "Invalid Email" });
      return;
    }
    const otp = await sendemail(req.body.email.toLowerCase());
    const time = parseInt(Date.now() / 1000) + 60;
    await User.findOneAndUpdate({ email: req.body.email }, { otp, time });
    res.send({ time });
  } catch (err) {
    return res.status(422).send({ error: "error in user validation" });
  }
});

router.post("/changepassword", async (req, res) => {
  try {
    let { password, email } = req.body;
    email=email.toLowerCase();
    bcrypt.genSalt(10, (err, salt) => {
      // salt bascially a random generater string
      if (err) {
        return res.status(422).send({ error: "Error in changing password" });
      }
      bcrypt.hash(password, salt, async (err, hash) => {
        if (err) {
          return res.status(422).send({ error: "Error in changing password" });
        }
        password = hash;
        await User.findOneAndUpdate({ email }, { password });
        res.status(204).send({});
      });
    });
  } catch (err) {
    return res.status(422).send({ error: "Error in changing password" });
  }
});

router.post("/changeusername", async (req, res) => {
  try {
    let { username, email } = req.body;
    email=email.toLowerCase();
    await User.findOneAndUpdate({ email }, { username });
    res.status(204).send({});
  } catch (err) {
    return res.status(422).send({ error: "Error in changing password" });
  }
});

module.exports = router;
