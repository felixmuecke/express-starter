const { User } = require('../models');
const httpStatus = require('http-status');
const { ApiError } = require('../errors/errors');
const { userService } = require('../services');

//register
// make a user doc
// send back tokens
// -> already exists

//login
// check the credentials
// return the user if ok
const loginWithEmailAndPassword = async (email, password) => {
  const user = await userService.getUserByEmail(email);
  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid email or password.');
  }
  return user;
};

//logout
// delete the refresh

//send reset email
// generate a password reset token
// store it
// send it with the email

//reset password
// check the reset token
// if ok store the new password
// login?

module.exports = {
  loginWithEmailAndPassword,
};
