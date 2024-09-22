// helpers/token.helpers.js
const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const client = require("../config/redis.config");
const { jwtDecode } = require("jwt-decode");
const parseDurationToSeconds = require("../utils/parseDurationToSeconds");

const signAccessToken = (id) => {
  return new Promise((resolve, reject) => {
    const payload = { id };
    const secret = process.env.ACCESS_TOKEN;
    const expiresIn = process.env.ACCESS_TOKEN_EXPIRE;
    const issuer = process.env.JWT_ISSUER;

    const options = {
      expiresIn,
      issuer,
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
    const payload = { id };
    const secret = process.env.REFRESH_TOKEN;
    const expiresIn = process.env.REFRESH_TOKEN_EXPIRE;
    const issuer = process.env.JWT_ISSUER;

    const options = {
      expiresIn,
      issuer,
      audience: String(id),
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
        // expiresIn,

        (err, reply) => {
          if (err) {
            console.error("Redis SET error:", err);
            reject(new AppError("Failed to store refresh token in Redis", 500));
            return;
          }

          resolve(token);
        }
      );
    });
  });
};

const verifyRefreshToken = (refreshToken) => {
  return new Promise((resolve, reject) => {
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN, (err, payload) => {
      if (err)
        return reject(
          new AppError(" can not verrify refresh token Unauthorized", 401)
        );
      const id = payload.aud; // Correctly extract the user ID
      client.GET(String(id), (err, result) => {
        // Correct typo in String(id)
        if (err) {
          reject(new AppError("ServerError", 500));
          return;
        }
        if (refreshToken === result) return resolve(id);
        reject(new AppError("Unauthorized", 401));
      });
    });
  });
};

const extractRefreshToken = (res, accessToken) => {
  return new Promise((resolve, reject) => {
    const decoded = jwtDecode(accessToken);
    const decodedId = decoded.id;
    client.GET(String(decodedId), (err, refreshToken) => {
      if (err || !refreshToken) {
        reject(new AppError("ServerError can not find refreshtoken", 500));
        return;
      }

      resolve(refreshToken);
    });
  });
};

const extractTokenFromHeaders = (req) => {
  return new Promise((resolve, reject) => {
    const authHeaders = req.headers.authorization || req.headers.Authorization;
    let token;
    if (req.headers && authHeaders) {
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
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
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
