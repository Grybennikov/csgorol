"use strict";

var express = require('express');
var router = express.Router();
var User = require('../controllers/user');
var passport = require('../policies/passport');
module.exports = function (app) {
  app.use('/api/user', router);
};

router

  /**
   * @api {post} / Создать новое сообщение
   * @apiName CreateChatMessage
   * @apiGroup ChatMessage
   * @apiSuccess {Number} id Идентификатор пользователя
   * @apiSuccess {String} text текст сообщения
   */
  .post('/', passport.isAdmin, User.createAction)

  /**
   * @api {get} / Список сообщений
   * @apiName ChatMessageList
   * @apiGroup ChatMessage
   * @apiSuccess {Number} id Идентификатор пользователя чата
   * @apiSuccess {String} text текст сообщения
   * @apiSuccess {Date} Время сообщения
   */
  .get('/', passport.isAdmin, User.listAction)
  .get('/game/top',  User.topAction)

  /**
   * @api {delete} /api/user/:id Удалить сообщение по переданному идентификатору
   * @apiName DeleteChatMessage
   * @apiGroup ChatMessage
   * @apiParam {Number} id Идентификатор сообщения
   */
  .delete('/:id', passport.isAdmin, User.removeAction)

  .get('/:id', passport.isAdmin, User.oneAction)

  .put('/:id', passport.isApiAuthenticated, User.updateAction)

  .put('/:id/diceFair', passport.isApiAuthenticated, User.updateDiceFairAction);

