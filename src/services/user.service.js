const httpStatus = require('http-status');
const { User } = require('../models');
const { ApiError } = require('../errors/errors');

const createUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  return User.create(userBody);
};

const getUserByEmail = async (email) => {
  return User.findOne({ email });
};

const getUserById = (id) => {
  return User.findById(id);
};

const getAllUsers = () => {
  return User.find();
};

module.exports = {
  createUser,
  getUserByEmail,
  getUserById,
  getAllUsers,
};
