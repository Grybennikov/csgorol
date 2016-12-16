"use strict";

var express = require('express');
var router = express.Router();
var Items = require('../controllers/items');
var passport = require('../policies/passport')
module.exports = function (app) {
  app.use('/api/item', router);
};

router

  .post('/', passport.isAdmin, Items.createAction)

  .put('/:id', Items.updateAction)

  .get('/', passport.isAdmin, Items.listAction)

  .get('/:id', passport.isAdmin, Items.oneAction)

  .delete('/:id', passport.isAdmin, Items.removeAction)
