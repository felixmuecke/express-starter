const mongoose = require('mongoose');
const app = require('./app');
const config = require('./config/config');

let server;
mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
  console.log('Connected to mongodb');
  server = app.listen(config.port, () => {
    console.log(`Server listening on port ${config.port}`);
  });
});

// server = app.listen(config.port, () => {
//   console.log(`Server listening on port ${config.port}`);
// });

const exitHandler = () => {
  if (server) {
    server.close(() => {
      console.log('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

// Make sure the program shuts down (and restarts via pm2 and the likes) in case of a programmer error
const unexpectedErrorHandler = (error) => {
  console.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  console.log('SIGTERM received');
  if (server) {
    server.close();
  }
});
