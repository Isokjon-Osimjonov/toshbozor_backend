const AdminSchema = require("../models/user.model");

const clearExpiredFileds = async () => {
  try {
    const now = new Date();
    // Find admin users whose passwordResetExpires is less than the current time
    const expiredUsers = await AdminSchema.find({
      passwordResetExpires: { $lt: now },
      otpExpires: { $lt: now },
      isVerified: false,
    });

    // Iterate over the expired users and clear the password reset token and expiration fields
    for (const user of expiredUsers) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      user.otp = undefined;
      user.otpExpires = undefined;
      await user.save({ validateBeforeSave: false });
    }
  } catch (error) {
    throw error;
  }
};

module.exports = { clearExpiredFileds };
