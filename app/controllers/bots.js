
"use strict";

const Promise = require('bluebird');
const request = Promise.promisify(require('request'));
const db = require('../models');
const config = require('../../config/config');
const SteamUser = require('steam-user');

module.exports.e2faCode = Promise.coroutine(function* (req, res, next) {
  try {
    let botName = req.params.name;

    let code = SteamUser.generateAuthCode(config.steam[botName].sharedSecret);

    res.send({code});

  } catch (err) {
    next(err);
  }
});
