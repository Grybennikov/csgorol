"use strict";

const express = require('express');
const router = express.Router();
const Games = require('../controllers/jackpotGames');
const passport = require('../policies/passport')

module.exports = function (app) {
  app.use('/api/jackpotGames', router);
};

router

  .get('/', Games.listAction)

  .get('/:gameNumber', Games.oneAction)
  .put('/:id', passport.isAdmin, Games.updateAction)
  .get('/qwe/qwe', Games.qwe)
