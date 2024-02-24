//   res.cookie("jwt", token, {
//     expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
//     httpOnly: true,
//     secure: req.secure || req.headers["x-forwarded-proto"] === "https",
//   });

// Remove password from output
//   data.password = undefined;

const jwt = require("jsonwebtoken");

const signToken = (id, username) => {
  return jwt.sign({ id, username }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (data, statusCode, req, res) => {
  // Check if data is undefined or null
  if (!data) {
    return res.status(500).json({ error: "Data is undefined or null" });
  }

  // Check if data has the expected properties
  if (!data._id || !data.username) {
    return res
      .status(500)
      .json({ error: "Data is missing required properties" });
  }

  const token = signToken(data._id, data.username);

  res.status(statusCode).json({
    token,
    data,
  });
};

module.exports = createSendToken;
