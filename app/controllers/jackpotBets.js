"use strict";

const path = require('path');
const Promise = require('bluebird');
const db = require('../models');
const config = require('../../config/config');
const EL = require('../helpers/errorsLog');
const request = require('request').defaults({ encoding: null });
Promise.promisifyAll(request);

/**
 * Returns list of jackpot bets
 */
module.exports.listAction = Promise.coroutine(function* (req, res, next) {
  try {
    let gameNumber = req.query.gameNumber;
    let current = req.query.current;
    let result = [];

    if (current) {
      let siteSettings = yield db.Info.list(true);

      result = yield db.JackpotBets.conditionList({
        where: {
          gameNumber: siteSettings.current_game
        }
      });
      result = yield Promise.map(result, function(e) {
        return request.getAsync(e.avatar, null)
          .then(function(response) {
            e.avatar =  "data:" + response.headers["content-type"] + ";base64," + new Buffer(response.body).toString('base64');
            return e;
          })
      });
    } else {
      result = yield db.JackpotBets.conditionList();
    }

    res.send(result);
  } catch (err) {
    next(err);
  }

});

