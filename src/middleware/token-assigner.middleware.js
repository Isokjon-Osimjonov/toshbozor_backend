const {
  extractTokenFromHeaders,
  verifyRefreshToken,
  signAccessToken,
} = require("../helpers/token.helpers");
const { asyncWrapper } = require("../utils/asyncWrapper");

const newAccesstokenAssigner = asyncWrapper(async (req, res, next) => {
  let token = extractTokenFromHeaders(req);
  console.log("token", token);
  const decodedUserId = await verifyRefreshToken(token);
  console.log("decodedUserId", decodedUserId);
  const accessToken = await signAccessToken(decodedUserId);
  console.log("accessToken", accessToken);
  next();
});

module.exports = newAccesstokenAssigner;
