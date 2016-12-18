"use strict";

var express = require('express');
var router = express.Router();
var JackpotBets = require('../controllers/jackpotBets');

module.exports = function (app) {
  app.use('/api/jackpotBets', router);
};

router
  .get('/', JackpotBets.listAction)
  .post('/', JackpotBets.createAction);
