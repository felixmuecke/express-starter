const { ApiError } = require('../errors/errors');
const httpStatus = require('http-status');
const passport = require('passport');

/**
 * In the end authenticate needs to be a function with the middleware signature.
 * We need to make sure to write the user to req.user if everything is ok or call next(error) with
 * an appropriate error if something is wrong
 *
 * passport.authenticate has the signature of middleware. The standard behaviour is to respond with a
 * 401 if something goes wrong. We want to overwrite this by providing a custom callback
 *
 * Our middleware executes passport.authenticate, providing req, res, next to it.
 */
const authenticate =
  (...roles) =>
  async (req, res, next) => {
    passport.authenticate('jwt', { session: false }, async (err, user, info) => {
      if (err || info || !user) return next(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
      req.user = user;

      if (roles.length && !user.hasOneOfRoles(roles)) {
        return next(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
      }

      next();
    })(req, res, next);
  };

module.exports = authenticate;
