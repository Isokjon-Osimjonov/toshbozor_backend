// helpers/token.helpers.js
const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const client = require("../redis/redis");
const parseDurationToSeconds = require("../utils/parseDurationToSeconds");
const { jwtDecode }= require ("jwt-decode");
const signAccessToken = (id) => {
  return new Promise((resolve, reject) => {
    const payload = { id };
    const secret = process.env.JWT_ACCESS_TOKEN_SECRET;
    const options = {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
      issuer: process.env.JWT_ISSUER,
      audience: String(id),
    };
    jwt.sign(payload, secret, options, (err, token) => {
      if (err) {
        reject(err);
      } else {
        resolve(token);
      }
    });
  });
};

const signRefreshToken = (id) => {
  return new Promise((resolve, reject) => {
    // Validate environment variables
    const payload = { id };
    const secret = process.env.JWT_REFRESH_TOKEN_SECRET;
    const expiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN;

    const options = {
      expiresIn,
      audience: String(id),
      issuer: process.env.JWT_ISSUER,
    };

    jwt.sign(payload, secret, options, (err, token) => {
      if (err) {
        console.error("JWT sign error:", err);
        reject(new AppError("Failed to sign JWT token", 500));
        return;
      }

      const stringId = String(id);

      client.SET(
        stringId,
        token,
        "EX",
        parseDurationToSeconds(expiresIn),
        (err, reply) => {
          if (err) {
            console.error("Redis SET error:", err);
            reject(new AppError("Failed to store refresh token in Redis", 500));
            return;
          }

          console.log("Redis SET reply:", reply);
          resolve(token);
        }
      );
    });
  });
};

const verifyRefreshToken = (refreshToken) => {
  return new Promise((resolve, reject) => {
    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_TOKEN_SECRET,
      (err, payload) => {
        if (err)
          return reject(
            new AppError(" can not verrify refresh token Unauthorized", 401)
          );
        const id = payload.aud; // Correctly extract the user ID
        client.GET(String(id), (err, result) => {
          // Correct typo in String(id)
          if (err) {
            console.log(err.message);
            reject(new AppError("ServerError", 500));
            return;
          }
          if (refreshToken === result) return resolve(id);
          reject(new AppError("Unauthorized", 401));
        });
      }
    );
  });
};

const extractRefreshToken = (accessToken) => {
  return new Promise((resolve, reject) => {
    const decoded = jwtDecode(accessToken);
    const decodedId = decoded.id;
    console.log(decodedId);
    client.GET(String(decodedId), (err, refreshToken) => {
      if (err || !refreshToken) {
        // Correct variable name to refreshToken
        console.log(err.message);
        reject(new AppError("ServerError", 500));
        return;
      }

      jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_TOKEN_SECRET,
        (err, result) => {
          // Use correct variable name for JWT_REFRESH_TOKEN_SECRET
          if (err) {
            return res.sendStatus(403); // Invalid or expired refresh token
          }
          resolve(result);
        }
      );
    });
  });
};

const extractTokenFromHeaders = (req) => {
  return new Promise((resolve, reject) => {
    let token;
    if (req.headers && req.headers.authorization) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      reject(
        new AppError("You are not logged in! Please log in to get access.", 401)
      );
    } else {
      resolve(token);
    }
  });
};

const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) reject(err, err.stack);
      resolve(decoded);
    });
  });
};

module.exports = {
  verifyToken,
  signAccessToken,
  extractTokenFromHeaders,
  signRefreshToken,
  verifyRefreshToken,
  extractRefreshToken,
};
