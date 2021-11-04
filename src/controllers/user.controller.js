const { userService } = require('../services');
const httpStatus = require('http-status');
const { catchAsync } = require('../errors/errors');

const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  if (!user) {
    return res.status(httpStatus.NOT_FOUND).send('User not found');
  }
  res.send(user);
});

const getAllUsers = catchAsync(async (req, res) => {
  const users = await userService.getAllUsers();
  res.send(users);
});

module.exports = {
  createUser,
  getUser,
  getAllUsers,
};
