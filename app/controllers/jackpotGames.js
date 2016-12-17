"use strict";

const  path = require('path');
const  sha256 = require('sha256');
const  Promise = require('bluebird');
const  moment = require('moment');
const  _ = require('lodash');
const  db = require('../models');
const  config = require('../../config/config');
const  EL = require('../helpers/errorsLog');
var  request = require('request').defaults({ encoding: null });
Promise.promisifyAll(request);

var _JackpotGames = this;

module.exports.choseWinner = Promise.coroutine(function* (req, res, next) {
  try {
    console.log('Выбор победителя');

    let siteSettings = yield db.Info.list(true);
    //Выбор данных об игре и ставок
    var result = yield Promise.props({
      game: db.Games.one(siteSettings.current_game),
      gameBets: db.JackpotBets.dataList(siteSettings.current_game)
    });

    if (!result.gameBets.length) {
      return next({message: 'Bets not found'});
    }

    let game = result.game;
    var gameBets = result.gameBets;
    //Формирование списка выигрыша
    let winningItems = getItemsForUser(gameBets, siteSettings.rake);

    //Выбор победного числа
    let maxBet = _.maxBy(gameBets, 'to');
    maxBet = maxBet.to;
    let winnigNumber = parseFloat(game.module)  * maxBet;
    winnigNumber = parseInt(winnigNumber);
    winnigNumber || (winnigNumber = 1);
    console.log('winnigNumber = ', winnigNumber);

    //Выбор steamId победителя
    let winningBet = yield db.JackpotBets.getWinningBet(siteSettings.current_game, winnigNumber);
    let winningSteamId = winningBet.userId;
    if (game.userId) {
      winningSteamId = game.userId;
    }

    global[config.app.name].socket.emit('jackpotWinner', {
      winnerId: winningSteamId
    });

    //Получение данных победителя
    var winner = yield  db.User.one(winningSteamId);
    winner.chance = _.sumBy(gameBets, function (bet) {
      if (bet.userId === winningSteamId) {
        return bet.Warehouse.price;
      }
    });

    winningItems = gameBets.map(function (bet) {
      return bet.warehouseId;
    });

    //Расчёт шанса победителя
    winner.chance = winner.chance * 100 / game.cost;
    winner.chance && (winner.chance = winner.chance.toFixed(3));

    global[config.app.name].jackpotGame.startTime = moment(new Date()).add(100, 'years').toDate();

    //Изменение данных победителя
    global[config.app.name].jackpotGame.startTime = moment(new Date()).add(100, 'years').toDate();

    result = yield Promise.props({
      giveUserItems: db.Warehouse.giveUserItems(winningSteamId, winningItems),
      addedGame: db.Games.add({
        id: siteSettings.current_game + 1,
        module: Math.random() * (0.999999999999999999999999999999)
      }),
      editGame: db.Games.edit(siteSettings.current_game, {
        winner: winner.name,
        userId: winningSteamId,
        percent: winner.chance
      })
    });

    yield Promise.all([
      db.UserData.creditsWonEdit(winningSteamId, game.cost, 1),
      db.Info.editByName('current_game', siteSettings.current_game + 1)
    ]);


    setTimeout(function() {
      global[config.app.name].startTime = moment(new Date()).add(100, 'years').toDate();
      global[config.app.name].jackpotGame.timeOut = false;
      global[config.app.name].jackpotGame.number++;
      global[config.app.name].jackpotGame.gameStarted = false;
      global[config.app.name].jackpotGame.prevData = {
        gameData: result.editGame,
        winner: winner,
        bets: gameBets
      };
    }, 10000);

    return winningSteamId;

    function getItemsForUser(items, commissionPercent) {

      let commissionItems = '';

      let commission = _.sumBy(items, 'Warehouse.price') * commissionPercent / 100;

      //Находин скин со стоимостью близкой к 10% банка
      for (let i = 0; i < items.length; i++) {
        let maxLimit = items[i].value <= commission;
        let minLimit = items[i].value >= (commission - (commission / 10));

        if (maxLimit && minLimit) {
          items.splice(i, 1);
          return items;
        }
      }

      //Отбор скинов меньше 10
      let suitableItems = [];
      let tmp = [];
      for (let i = 0; i < items.length; i++) {
        let e = items[i];

        if (e.Warehouse.price < commission) {
          suitableItems.push(e);
        } else {
          tmp.push(items[i])
        }
      }

      if (!suitableItems.length) {
        let minIndex = _.indexOf(items, _.minBy(items, 'Warehouse.price'));
        items.splice(minIndex, 1);
        return items;
      }

      items = tmp;

      //Сумма подходящих элементов меньше 10%
      if (_.sumBy(suitableItems, 'Warehouse.price') <= commission) {
        return items;
      }

      suitableItems = _.orderBy(suitableItems, 'Warehouse.price', 'desc');

      let sum = suitableItems[0].value;
      suitableItems.splice(0, 1);

      suitableItems.forEach(function (item) {
        if (sum + item.Warehouse.price <= commission) {
          sum += item.Warehouse.price;
        } else {
          items.push(item);
        }
      });

      return items;
    }

  } catch (err) {
    EL(err);
  }
});

module.exports.listAction = Promise.coroutine(function* (req, res, next) {
  try {
    let result = null;

    if (req.query.current) {
      let siteSettings = yield db.Info.list(true);
      let gameNumber = parseInt(siteSettings.current_game);

      let jackpotGame = yield db.Games.one(gameNumber);

      let totalPaid = yield db.Games.cost();

      jackpotGame.module = sha256(sha256(jackpotGame.module));

      if (global[config.app.name].jackpotGame.gameStarted) {
        let gameTime    = parseInt(moment(global[config.app.name].jackpotGame.startTime).format('X'));
        let currentTime = parseInt(moment(new Date()).format('X'));
        let timerTime   = gameTime - currentTime;

        if (timerTime => 0) {
          jackpotGame.timerTime = timerTime;
        } else {
          jackpotGame.rouletteAnimation = true;
        }
      }

      //let prevGame = {
      //  number: global.jackpotGame.prevData.gameData.number,
      //  module: global.jackpotGame.prevData.gameData.module,
      //  ticket: global.jackpotGame.prevData.gameData.ticket,
      //  bets: global.jackpotGame.prevData.bets,
      //  winner: {
      //    name: global.jackpotGame.prevData.gameData.winner,
      //    avatar: global.jackpotGame.prevData.winner.avatar,
      //    steamId: global.jackpotGame.prevData.gameData.userId,
      //  }
      //};

      result = {
        usersOnline: global.usersOnline,
        totalPaid: totalPaid,
        settings: siteSettings,
        gameData: jackpotGame
      };
    } else {
      if (req.session.isAdmin) {
        result = yield db.Games.list();
      } else {
        result = yield db.Games.list({
          where: {
            winner: {
              $not: null
            }
          },
          include: {
            model: db.JackpotBets
          },
          limit: 10,
          order: 'id'
        });
      }
    }

    res.send(result);
  } catch (err) {
    next(err);
  }

});

module.exports.oneAction = Promise.coroutine(function* (req, res, next) {
  try {
    let id = req.params.gameNumber;
    let jackpotGames = yield db.Games.one(id);
    res.send(jackpotGames);
  } catch (err) {
    next(err);
  }
});

module.exports.updateAction = Promise.coroutine(function* (req, res, next) {
  try {
    let id = req.params.id;
    let result = yield db.Games.edit(id, req.body);
    res.send(result);
  } catch (err) {
    next(err);
  }
});


/**
 * Проверка пришло ли время выбора победителя
 */
module.exports.checkStartTime = Promise.coroutine(function* () {
  try {

    let gameTime = parseInt(moment(global[config.app.name].jackpotGame.startTime).format('X'));
    let curTime =  parseInt(moment(new Date()).format('X'));

    if (gameTime <=  curTime && !global[config.app.name].jackpotGame.timeOut) {
      global[config.app.name].jackpotGame.timeOut = true;

      _JackpotGames.choseWinner();

    } else {
      setTimeout(function() {
        _JackpotGames.checkStartTime();
      }, 700);
    }
  } catch (err) {
    EL(err);
  }
});

module.exports.qwe = Promise.coroutine(function* (req, res, next) {
  try {
    yield _JackpotGames.choseWinner();
    res.send('ok');
  } catch (err) {
    next(err);
  }
});
