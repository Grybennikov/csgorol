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
    let result = yield db.User.add(req.body);
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
    let result = yield db.User.list(req.query);
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
    let result = yield db.User.remove(id);
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
    let user = yield db.User.one(id);
    res.send(user);
  } catch (err) {
    next(err);
  }
});

module.exports.updateAction = Promise.coroutine(function* (req, res, next) {
  try {
    let admin = req.session.isAdmin;
    let id =  admin ? req.params.id: req.user.userData.steamId;
    let result = null;
    if (admin) {
       result = yield db.User.edit(id,req.body);
    } else {
       result = yield db.UserData.edit(id, {tlink: req.body.tlink});
    }
    res.send(result);
  } catch (err) {
    next(err);
  }
});

module.exports.topAction = Promise.coroutine(function* (req, res, next) {
  try {
    let result = yield db.User.topPlayers();
    res.send(result);
  } catch (err) {
    next(err);
  }

});
