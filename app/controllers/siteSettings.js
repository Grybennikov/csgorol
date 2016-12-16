"use strict";

var path = require('path');
var Promise = require('bluebird');
var db = require('../models');
var config = require('../../config/config');

/**
 * Create new user
 */
module.exports.createAction = Promise.coroutine(function* (req, res, next) {
  try {
    let siteSettings = req.body;
    let result = yield db.Info.add(siteSettings);
    res.send(result);
  } catch (err) {
    next(err);
  }

});

/**
 * Returns list of users
 */
module.exports.listAction = Promise.coroutine(function* (req, res, next) {
  try {
    let result = yield db.Info.list(req.query.toObject);
    res.send(result);
  } catch (err) {
    next(err);
  }

});
/**
 * Remove one user
 */
module.exports.removeAction = Promise.coroutine(function* (req, res, next) {
  try {
    let id = req.params.id;
    let result = yield db.Info.remove(id);
    res.status(200).send({
      deleted: result
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Returns one user
 */
module.exports.oneAction = Promise.coroutine(function* (req, res, next) {
  try {
    let id = req.params.id;
    let siteSettings = yield db.Info.one(id);
    res.send(siteSettings);
  } catch (err) {
    next(err);
  }
});

module.exports.updateAction = Promise.coroutine(function* (req, res, next) {
  try {
    let name = req.params.id;
    let result = yield db.Info.edit(name, req.body);
    global[config.app.name].socket.emit('settingsChanged', {
      settings: yield db.Info.list(true)
    });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});
