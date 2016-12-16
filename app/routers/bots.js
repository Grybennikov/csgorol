"use strict";

const express = require('express');
const router = express.Router();
const Bot = require('../controllers/bots');
const JackpotGames = require('../controllers/jackpotGames');
var passport = require('../policies/passport')

module.exports = function (app) {
  app.use('/api/', router);
};

router
  .get('/2fa/code/:name', passport.isAdmin, Bot.e2faCode);

