const mongoose = require("mongoose");
const httpStatus = require("http-status");
const config = require("../config/config");
const logger = require("../config/logger");

const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, stack = "") {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// Convert all kinds of errors to ApiErrors
// Expand this once there are more potential errors floating around.
const convertNonApiErrors = (error) => {
  if (error instanceof ApiError) return error;

  /**
   * If the statusCode wasn't explicitly provided during error creation, it might
   * be a mongo error in which case I've probably messed up validation.
   * If it's not that, than something bad happened (ISE).
   * Neither of these cases should happen, so treat everything as not operational (programmer error)
   */
  const statusCode =
    error.statusCode || error instanceof mongoose.Error
      ? httpStatus.BAD_REQUEST
      : httpStatus.INTERNAL_SERVER_ERROR;

  const message = error.message || httpStatus[statusCode];

  return new ApiError(statusCode, message, false, error.stack);
};

const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = convertNonApiErrors(err);

  // In production let's not expose any details about programmer errors
  if (config.env === "production" && !err.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
  }

  // So morgan can log the messages
  res.locals.errorMessage = message;

  const response = {
    code: statusCode,
    message,
    ...(config.env === "development" && { stack: err.stack }),
  };

  if (config.env === "development") {
    logger.error(err);
  }

  res.status(statusCode).send(response);
};

module.exports = {
  catchAsync,
  ApiError,
  errorHandler,
};
