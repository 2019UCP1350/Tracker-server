const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  isEmailVerified: {
    type: Boolean,
    require: true,
    default: false,
  },
  otp: {
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
  time: {
    type: Number,
    default: 0,
  },
  username: {
    type: String,
    default: "RandomUser",
  },
});

userSchema.pre("save", function (next) {
  const user = this;
  if (!user.isModified("password")) {
    return next();
  }
  bcrypt.genSalt(10, (err, salt) => {
    // salt bascially a random generater string
    if (err) {
      return next(err);
    }
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) {
        return next(err);
      }
      user.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function (candidatePassword) {
  const user = this;

  return new Promise((resolve, reject) => {
    bcrypt.compare(candidatePassword, user.password, (err, isMatch) => {
      if (err) {
        return reject(err);
      }

      if (!isMatch) {
        return reject(false);
      }
      resolve(true);
    });
  });
};

mongoose.model("User", userSchema); // by default it is imported when we include
// this file in any other file
