"use strict";

var path = require('path');
var _ = require('lodash');
var Promise = require('bluebird');
var db = require('../models');
var config = require('../../config/config');
var LC = require('../i18n');
var sha256 = require('sha256');


module.exports.renderHomeAction = Promise.coroutine(function* (req, res, next) {
  try {
    var user = null;
    let warehouseItems = null;

    if (req.user) {
      user = req.user;
    }
    res.render('index', {
      title: config.siteName,
      user: req.user
    });

  } catch (err) {
    next(err);
  }
});
module.exports.renderAdminAction = function (req, res, next) {
  try {
    res.render('admin', {
      title: 'Admin | ' + config.siteName
    });

  } catch (err) {
    next(err);
  }
};

module.exports.adminSessionAction = Promise.coroutine(function* (req, res, next) {
  try {
    if (req.body.login == 'csg@gmail.com' && req.body.password === 'csg') {
      req.session.isAdmin = true;
      res.redirect('/admin');
    } else {
      res.render('../views/adminLogin', {
        title: 'Admin login | ' + config.siteName,
        err: 'Invalid data'
      });
    }
  } catch (err) {
    next(err);
  }
});
module.exports.adminDestroySessionAction = Promise.coroutine(function* (req, res, next) {
  try {
    req.session.isAdmin = false;
    res.redirect('/admin');
  } catch (err) {
    next(err);
  }
});


