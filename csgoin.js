const express = require('express');
const config = require('./config/config');
const db = require('./app/models');
const Socket = require('./app/controllers/socket');
const startActions = require('./app/helpers/startActions');
const  moment = require('moment');


const app = express();
var socketIo = require('socket.io');

global[config.app.name] = {};

require('./config/express')(app, config);

db.sequelize
  .sync()
  .then(function () {

    global.manager = {};
    global.community = {};

    var server = app.listen(config.port, function () {
      console.log('Express server listening on port ' + config.port);
      startActions();
    });

    socketIo = socketIo.listen(server);
    socketIo.on('connection', Socket);
    global[config.app.name].socket = socketIo;

  }).catch(function (e) {
  throw new Error(e);
});
