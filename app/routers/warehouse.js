"use strict";

const express = require('express');
const router = express.Router();
const Warehouse = require('../controllers/warehouse');
const passport = require('../policies/passport');

module.exports = function (app) {
  app.use('/api/warehouse', router);
};

router

  .get('/',           passport.isApiAuthenticated,  Warehouse.listAction)
  .post('/withdraw',  passport.isApiAuthenticated,  Warehouse.withdrawAction);
