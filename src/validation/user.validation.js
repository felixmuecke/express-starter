const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

const createUser = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    name: Joi.string().required(),
  }),
};

const getUser = {
  params: Joi.object().keys({
    id: Joi.required().custom(objectId),
  }),
};

module.exports = {
  createUser,
  getUser,
};
