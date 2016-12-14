'use strict';

/**
 * Module dependencies.
 */
const express = require('express');
const fs = require('fs');
const passport = require('passport');
const logger = require('mean-logger');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const io = require('socket.io');
require('dotenv').config({
  silent: true
});

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

//Load configurations
//if test env, load example file

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
const config = require('./config/config');
const auth = require('./config/middlewares/authorization');
const mongoose = require('mongoose');


//Bootstrap db connection
// mongoose.Promise = global.Promise;
mongoose.connect(config.db);

//Bootstrap models
const models_path = __dirname + '/app/models';
const walk = function (path) {
  fs.readdirSync(path).forEach(function (file) {
    let newPath = path + '/' + file;
    let stat = fs.statSync(newPath);
    if (stat.isFile()) {
      if (/(.*)\.(js|coffee)/.test(file)) {
        require(newPath);
      }
    } else if (stat.isDirectory()) {
      walk(newPath);
    }
  });
};

walk(models_path);

//bootstrap passport config
require('./config/passport')(passport);

const app = express();

app.use(function (req, res, next) {
  next();
});


//express settings
require('./config/express')(app, passport, mongoose);

//Bootstrap routes
require('./config/routes')(app, passport, auth);

//Start the app by listening on <port>
const server = app.listen(config.port);
const ioObj = io.listen(server, {
  log: false
});
//game logic handled here
require('./config/socket/socket')(ioObj);
console.log('Express app started on port ' + config.port);

//Initializing logger
logger.init(app, passport, mongoose);

//expose app
exports = module.exports = app;
