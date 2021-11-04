const httpStatus = require('http-status');
const { ApiError, catchAsync } = require('../errors/errors');
const { userService, tokenService, authService } = require('../services');

const register = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  const tokens = await tokenService.generateAuthTokens(user);
  return res.status(httpStatus.CREATED).send({ user, tokens });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user);
  return res.send({ user, tokens });
});

//logout
//reset password
//email confirm

module.exports = {
  register,
  login,
};
