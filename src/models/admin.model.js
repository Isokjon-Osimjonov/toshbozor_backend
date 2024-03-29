// Import necessary modules and dependencies
const { Schema, model } = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const generateOTP = require("../utils/otp-generator");
const { ref } = require("joi");

// Define the schema for the admin user
const adminSchema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: [true, "Username is already taken please try another"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: [true, "Email is already taken please try another"],
    },
    avatar: {
      type: String,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    passwordConfirm: {
      type: String,
      required: [true, "Please confirm your password"],

      validate: {
        // Custom validator to ensure password confirmation matches password
        validator: function (el) {
          return el === this.password;
        },
        message: "Passwords are not the same!",
      },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["admin", "assistant"],
      default: "assistant",
    },
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: "Marble",
      },
    ],
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    otp: String,
    otpExpires: Date,
  },
  { timestamps: true } // Automatically add timestamps to documents
);

// Method to generate JWT token for the admin user
adminSchema.methods.generateToken = function () {
  return jwt.sign(
    { id: this._id, username: this.username },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );
};

// Pre-save hook to hash the password before saving it to the database
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined; // Remove the passwordConfirm field
  next();
});

// Pre-save hook to update the passwordChangedAt field when password is modified
adminSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Method to compare entered password with stored hashed password
adminSchema.methods.correctPassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to check if the password has been changed after issuing a JWT token
adminSchema.methods.isPasswordChanged = function (jwt_iat) {
  if (this.passwordChangedAt) {
    const changedAt = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return jwt_iat < changedAt;
  }
  return false;
};

// Method to create a password reset token
adminSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

  return resetToken;
};

// Method to send verification OTP
adminSchema.methods.sendVerificationOTP = function () {
  const otp = generateOTP(); // Generate OTP using utility function

  this.otp = crypto.createHash("sha256").update(otp).digest("hex");
  this.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

  return otp;
};

// Export the Admin model with the defined schema
module.exports = model("Admin", adminSchema);
