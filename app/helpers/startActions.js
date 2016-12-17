"use strict";

const Sequelize = require('sequelize');
const Promise = require('bluebird');
const moment = require('moment');
const _ = require('lodash');
const coroutine = Promise.coroutine;
const fsp = require('fs-promise');

const config = require('../../config/config');
const db = require('../models');

const EL = require('../helpers/errorsLog');

//пакеты Steam
const SteamUser = require('steam-user');

//bots
const WarehouseBot = require('../bots/warehouse');


const JackpotGame = require('../controllers/jackpotGames');

module.exports = function () {

  //переменные Steam
  global.mainSteamUser = new SteamUser();
  Promise.promisifyAll(global.mainSteamUser);

  global.warehouseBots = {};


  // Steam logon options
  var logOnOptions = {
    "accountName": config.steam.mainAccount.accountName,
    "password": config.steam.mainAccount.password
  };

  EL.checkLogFile();

  //logIn main Steam user
  global.mainSteamUser.logOn(logOnOptions);

  let warehouse = new WarehouseBot({
    sharedSecret: config.steam.warehouseBot.sharedSecret,
    identitySecret: config.steam.warehouseBot.identitySecret,
    accountName: config.steam.warehouseBot.accountName,
    password: config.steam.warehouseBot.password
  });

  warehouse.start();

  //Настройки игры jackpot
  global[config.app.name].jackpotGame = {
    winnerData: {},
    startTime: moment(new Date()).add(100, 'years').toDate(),
    timeOut: false,
    prevData: {
      gameData: {},
      winner: {},
      bets: []
    }
  };

  JackpotGame.checkStartTime();

}
