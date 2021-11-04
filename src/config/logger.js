const { createLogger, format, transports } = require("winston");
const config = require("./config");

/**
 * Winston seems a bit of a mess, see the comment at format.errors
 * Would like to swap this out eventually for bunyan or maybe pino
 */

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.errors({ stack: true }) // This needs to be in top level format to work. Basically, when an Error is passed to the logger, adds message and stack to the info object to be used in custom or standard formats. Breaks if used in transport level formats!?
  ),
  transports: [
    new transports.File({
      level: "error",
      filename: "error.log",
      format: format.combine(format.timestamp(), format.json()),
    }),
  ],
});

if (config.env !== "production") {
  logger.add(
    new transports.Console({
      level: "debug",
      format: format.combine(
        format.colorize(),
        format.printf(
          ({ level, message, stack }) => `${level}: ${stack ? stack : message}`
        )
      ),
    })
  );
}

module.exports = logger;
