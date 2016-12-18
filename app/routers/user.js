"use strict";

var express = require('express');
var router = express.Router();
var User = require('../controllers/user');
var passport = require('../policies/passport');
module.exports = function (app) {
  app.use('/api/user', router);
};

router

  .post('/', passport.isAdmin, User.createAction)

  .get('/', passport.isAdmin, User.listAction)
  .get('/game/top',  User.topAction)
  .delete('/:id', passport.isAdmin, User.removeAction)

  .get('/:id', passport.isAdmin, User.oneAction)

  .put('/:id', passport.isApiAuthenticated, User.updateAction);