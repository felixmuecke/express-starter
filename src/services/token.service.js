const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { tokenTypes } = require('../config/tokens');
const { Token } = require('../models');

/**
 * @param  {} userId
 * @param  {} expires
 * @param  {} tokenType
 *
 * @returns A signed token
 */
const generateToken = (userId, expires, type) => {
  const payload = {
    sub: userId,
    exp: expires,
    iat: Date.now(),
    type,
  };

  return jwt.sign(payload, config.jwt.secret);
};

//save token
//Needs a Token model
const saveToken = async (token, userId, expires, tokenType) => {
  return await Token.create({
    token,
    user: userId,
    expires,
    tokenType,
  });
};

// verify token, load from the databse and return payload if all good
const verifyToken = async (token) => {
  const payload = token.verify(token, config.jwt.secret);
  const tokenDoc = await Token.findOne({ token, blacklisted: false });
};

//generate both refresh and access auth tokens on one go to be send back
const generateAuthTokens = async (user) => {
  const accessToken = generateToken(user.id, Date.now() + config.jwt.accessExpirationMinutes * 6e4, tokenTypes.ACCESS);

  const refreshExpires = Date.now() + config.jwt.refreshExpirationDays * 864e5;
  const refreshToken = generateToken(user.id, refreshExpires, tokenTypes.REFRESH);
  await saveToken(refreshToken, user.id, refreshExpires, tokenTypes.REFRESH);

  return {
    accessToken,
    refreshToken,
  };
};

//generate email verification token

// generate password reset token

module.exports = {
  generateToken,
  verifyToken,
  generateAuthTokens,
};
