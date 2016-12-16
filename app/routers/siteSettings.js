"use strict";

var express = require('express');
var router = express.Router();
var SiteSettings = require('../controllers/siteSettings');
var passport = require('../policies/passport')
module.exports = function (app) {
  app.use('/api/siteSettings', router);
};

router

  .post('/', passport.isAdmin, SiteSettings.createAction)

  .put('/:id', passport.isAdmin, SiteSettings.updateAction)

  .get('/', passport.isAdmin, SiteSettings.listAction)

  .get('/:id', passport.isAdmin, SiteSettings.oneAction)

  .delete('/:id', passport.isAdmin, SiteSettings.removeAction)
