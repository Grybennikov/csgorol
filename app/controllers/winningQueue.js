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
    let winningsQueue = req.body;
    let result = yield db.WinningsQueue.add(winningsQueue);
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
    let result = yield db.WinningsQueue.list(req.query);
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
    let result = yield db.WinningsQueue.remove(id);
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
    let winningsQueue = yield db.WinningsQueue.one(id);
    res.send(winningsQueue);
  } catch (err) {
    next(err);
  }
});

module.exports.updateAction = Promise.coroutine(function* (req, res, next) {
  try {
    let id = req.params.id;
    let result = yield db.WinningsQueue.edit(id, req.body);
    res.send(result);
  } catch (err) {
    next(err);
  }
});
