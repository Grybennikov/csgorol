"use strict";

const path = require('path');
const Promise = require('bluebird');
const db = require('../models');
const config = require('../../config/config');

/**
 * Create new chat message
 */
module.exports.createAction = Promise.coroutine(function* (req, res, next) {
  try {
    let message = req.body;
    message.chatUserId = req.user.userData.steamId;
    let result = yield db.ChatMessage.add(message);
    let messageData =  yield db.ChatMessage.one(result.id);

    global[config.app.name].socket.emit('newMessage', messageData);
    res.send(result);
  } catch (err) {
    next(err);
  }
});

module.exports.listAction = Promise.coroutine(function* (req, res, next) {
  try {
    let result = yield db.ChatMessage.list();
    res.send(result);
  } catch (err) {
    next(err);
  }
});

module.exports.removeAction = Promise.coroutine(function* (req, res, next) {
  try {
    let chatUserId = req.params.id;
    let result = yield db.ChatMessage.remove(chatUserId);
    res.status(200).send({
      deleted: result
    });
  } catch (err) {
    next(err);
  }
});

