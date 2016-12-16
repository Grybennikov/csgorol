"use strict";

var passport = require('../policies/passport');
var db = require('../models');
var path = require('path');
var config = require('../../config/config');
var sha256 = require('sha256');


module.exports.loginAction = function (req, res, next) {
  try {
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    var steamId = req.query['openid.identity'].split('/id/')[1];
    ip = ip.substr(7);

    res.redirect('/');
/*
    db.User.edit(steamId, {
        ip: ip,
        visitDate: new Date()
      })
      .then(function () {
        res.redirect('/');
      })*/

  } catch (err) {
    next(err);
  }
};

module.exports.logOutAction = function (req, res) {
  try {
    req.logout();
    res.redirect('/');
  } catch (err) {
    next(err);
  }
}

