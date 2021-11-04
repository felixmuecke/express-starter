const express = require('express');
const cors = require('cors');
const logger = require('./config/logger');
const morgan = require('./config/morgan');
const helmet = require('helmet');
const routes = require('./routes/v1');
const { ApiError, errorHandler } = require('./errors/errors');
const httpStatus = require('http-status');
const app = express();

//Setup passport jwt strategy
require('./config/passport');

app.use(morgan.successHandler);
app.use(morgan.errorHandler);

app.use(cors());
app.use(helmet());

// parse json request body
app.use(express.json());

app.use('/v1', routes);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

app.use(errorHandler);

module.exports = app;
