"use strict";

var express = require('express');
var router = express.Router();
var Home = require('../controllers/home');
var passport = require('../policies/passport');
var asmCrypto = require('asmcrypto-lite');
var sha512 = require('sha512')

module.exports = function (app) {
  app.use('/', router);
};

router

  .get('/', Home.renderHomeAction)

  .get('/admin', passport.isAdminRender, Home.renderAdminAction)

  .post('/adminLogin', Home.adminSessionAction)

  .get('/admin/logout', Home.adminDestroySessionAction);
