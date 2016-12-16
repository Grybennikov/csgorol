"use strict";

var express = require('express');
var passport = require('passport');
var router = express.Router();
var Session = require('../controllers/session');

module.exports = function (app) {
  app.use('/', router);
};

router

  .get('/login', passport.authenticate('steam'))

  .get('/auth/steam/return', passport.authenticate('steam', { failureRedirect: '/' }), Session.loginAction)

  .get('/logout', Session.logOutAction);
