const Joi = require('joi');
const httpStatus = require('http-status');
const pick = require('../utils/pick');
const { ApiError } = require('../errors/errors');

const validate = (schema) => (req, res, next) => {
  // The way the validationSchema is constructed here allows me to
  // specify in my validation file where (params, body...) I expect my data. Neat.
  const validSchema = pick(schema, ['params', 'query', 'body']);
  const object = pick(req, Object.keys(validSchema));
  const { value, error } = Joi.compile(validSchema).validate(object, { abortEarly: false });

  if (error) {
    const errorMessage = error.details.map((details) => details.message).join(', ');
    return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
  }
  Object.assign(req, value);
  return next();
};

module.exports = validate;
