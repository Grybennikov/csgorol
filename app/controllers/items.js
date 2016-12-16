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
    let items = req.body;
    let result = yield db.Items.add(items);
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
    let result = yield db.Items.list(req.query);
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
    let result = yield db.Items.remove(id);
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
    let items = yield db.Items.one(id);
    res.send(items);
  } catch (err) {
    next(err);
  }
});

module.exports.updateAction = Promise.coroutine(function* (req, res, next) {
  try {
    let id = req.params.id;
    let result = yield db.Items.edit(id, req.body);
    res.send(result);
  } catch (err) {
    next(err);
  }
});
