"use strict";

var express = require('express');
var router = express.Router();
var ChatMessage = require('../controllers/chatMessage');
var passport = require('../policies/passport');
module.exports = function (app) {
  app.use('/api/chat', router);
};

router

  /**
   * @api {post} / Создать новое сообщение
   * @apiName CreateChatMessage
   * @apiGroup ChatMessage
   * @apiSuccess {Number} id Идентификатор пользователя
   * @apiSuccess {String} text текст сообщения
   */
  .post('/', passport.isApiAuthenticated, ChatMessage.createAction)

  /**
   * @api {get} / Список сообщений
   * @apiName ChatMessageList
   * @apiGroup ChatMessage
   * @apiSuccess {Number} id Идентификатор пользователя чата
   * @apiSuccess {String} text текст сообщения
   * @apiSuccess {Date} Время сообщения
   */
  .get('/', ChatMessage.listAction)

  /**
   * @api {delete} /:id Удалить сообщение по переданному идентификатору
   * @apiName DeleteChatMessage
   * @apiGroup ChatMessage
   * @apiParam {Number} id Идентификатор сообщения
   */
  .delete('/:id', passport.isAdmin, ChatMessage.removeAction);

