const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, "A user must have a name"],
  },
  email: {
    type: String,
    trim: true,
    unique: true,
    lowercase: true,
    required: [true, "A user must have an email"],
    validate: [validator.isEmail, "Provide a valid email"],
  },
  role: {
    type: String,
    enum: {
      values: ["admin", "user", "guide", "leadGuide"],
      message: "User role should either be admin, user, guide or leadGuide",
    },
    default: "user",
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: 8,
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, "Confirm password is required"],
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: "Password and confirm password are not matching",
    },
  },
  passwordUpdatedAt: {
    type: Date,
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  // If password is modified
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

userSchema.methods.isChangedPasswordAfterTokenIssued = function (jwtTimestamp) {
  if (this.passwordUpdatedAt) {
    const passwordTimestamp = this.passwordUpdatedAt.getTime() / 1000;
    return passwordTimestamp > jwtTimestamp;
  }
  return false;
};

userSchema.methods.createResetPasswordToken = function () {
  const passwordToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(passwordToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return passwordToken;
};

module.exports = mongoose.model("User", userSchema, "Users");
