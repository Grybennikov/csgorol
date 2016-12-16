"use strict";

var express = require('express');
var router = express.Router();
var Games = require('../controllers/jackpotGames');
var passport = require('../policies/passport')

module.exports = function (app) {
  app.use('/api/jackpotGames', router);
};

router

  .get('/', Games.listAction)

  .get('/:gameNumber', Games.oneAction)
  .put('/:id', passport.isAdmin, Games.updateAction)
  .get('/qwe/qwe', Games.qwe)
