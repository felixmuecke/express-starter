const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const config = require('../config/config');
const { User } = require('../models');

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.jwt.secret,
};

passport.use(
  new JwtStrategy(options, async (payload, done) => {
    try {
      const user = await User.findOne({ id: payload.sub });
      if (!user) return done(null, false);
      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  })
);
