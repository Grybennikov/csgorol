"use strict";

var Promise = require('bluebird');
var path = require('path');
var fsp = require('fs-promise');
var moment = require('moment');

var db = require('../models');
var config = require('../../config/config');


/**
 * Проверяет все новые предложения
 */
module.exports = Promise.coroutine(function* (err) {
  try {
    let appError = false;
    console.log(err.type || 'appError');
    console.log(err.message);

    switch (err.type) {
      case 'appError':
      {
        appError = true;
        break;
      }
      case 'offerRejected':
      {
        yield db.PrivateMessages.addOld(err.userId, err.msg);
        break;
      }
      default:
      {
        appError = true;
      }
    }

    //Если системная ошибка записываем в логи
    appError && saveToFile(err);

  } catch (err) {
    saveToFile(err);
  }
});

/**
 * Проверяет наличие файла для логов
 */
module.exports.checkLogFile = Promise.coroutine(function* (err) {
  let logFile = path.normalize(config.root + '/' + config.logFileName);

  try {
    yield fsp.ensureFile(logFile);
    yield fsp.readJson(logFile, {encoding: 'utf8'});

  } catch (err) {
    return fsp.writeJson(logFile, {});
  }
});

/**
 * Функция сохраняет ошибки в файл log.txt
 * @param err Объект ошибки
 * @paramExemple
 * {
 *  type: 'system',
 *  msg: 'Не получен userid'
 * }
 */
function saveToFile(err) {
  return Promise.coroutine(function* () {
    let logFile = path.normalize(config.root + '/' + config.logFileName);

    let errorLog = yield fsp.readJson(logFile, {encoding: 'utf8'});
    errorLog[moment(new Date()).format('DD.MM.Y - hh:mm')] = JSON.stringify(err);
    yield fsp.writeJson(logFile, errorLog);
    return true;
  })();
}
