/**
 * - Load env vars here and expose them via config object
 * - Set additional settings for db connection
 * - validate .env file via Joi and set sensible defaults, all in one place
 */
const Joi = require("joi");
const path = require("path");

const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, "../../.env") });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string()
      .valid("production", "development", "test")
      .required(),
    PORT: Joi.number().default(3000),
    DB_URI: Joi.string().required().description("Mongo DB url"),
    JWT_SECRET: Joi.string().required(),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number()
      .default(30)
      .description("minutes after which access tokens expire"),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number()
      .default(30)
      .description("days after which refresh tokens expire"),
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description("minutes after which reset password token expires"),
    JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description("minutes after which verify email token expires"),
  })
  .unknown();

const { error, value: envVars } = envVarsSchema.validate(process.env, {
  abortEarly: false,
});

if (error) {
  throw new Error(`Config validation error ${error.message}`);
}

module.exports = {
  mongoose: {
    url: envVars.DB_URI,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  port: envVars.PORT,
  env: envVars.NODE_ENV,
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes:
      envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
  },
};
