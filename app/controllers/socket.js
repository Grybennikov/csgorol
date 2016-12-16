'use strict';


const db = require('./../models');
const Promise = require('bluebird');
const config = require('../../config/config');

const ChatMessage = require('./chatMessage');


module.exports = function (socket) {
  if (global.usersOnline) {
    global.usersOnline += 1;
  } else {
    global.usersOnline = 1;
  }

  global[config.app.name].socket.emit('usersOnline', {
    count: global.usersOnline
  });
  var index = -1;
  socket.on('disconnect', function(data){
    global.usersOnline -= 1;
    if (global.usersOnline < 0) {
      global.usersOnline = 0;
    }
    global[config.app.name].socket.emit('usersOnline', {
      count: global.usersOnline
    });
    console.log('user disconnected');
  });
};
