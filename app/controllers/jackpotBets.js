"use strict";

const Sequelize = require('sequelize');
const path = require('path');
const Promise = require('bluebird');
const db = require('../models');
const config = require('../../config/config');
const _ = require('lodash');
const moment = require('moment');
const sha256 = require('sha256');
const EL = require('../helpers/errorsLog');
const LC = require('../i18n');
const request = require('request').defaults({ encoding: null });
Promise.promisifyAll(request);

/**
 * Returns list of jackpot bets
 */
module.exports.listAction = Promise.coroutine(function* (req, res, next) {
  try {
    let gameNumber = req.query.gameNumber;
    let current = req.query.current;
    let result = [];

    if (current) {
      let siteSettings = yield db.Info.list(true);

      result = yield db.JackpotBets.dataList(siteSettings.current_game, {avatar: true});
    } else {
      if (req.session.isAdmin) {
        result = yield db.JackpotBets.conditionList({include: db.Warehouse});
      } else {
        result = [];
      }
    }

    res.send(result);
  } catch (err) {
    next(err);
  }

});

/**
 * Create new jackpot bet
 */
module.exports.createAction = Promise.coroutine(function* (req, res, next) {
  try {
    let userId = req.user.id;
    let betItems = req.body.betItems;

    let result = yield Promise.props({
      siteSettings: yield db.Info.list(true),
      userData: db.User.one(userId),
      userWarehouse: yield db.Warehouse.list({
        where: {
          ownerId: userId,
          id: {
            $in: betItems
          }
        }
      }),
    });

    let siteSettings = result.siteSettings;
    betItems = result.userWarehouse;
    let userData = result.userData;

    if (userData.ban) {
      return res.sendStatus(423);
    }

    if (!siteSettings.current_game) {
      return res.status(500).json({message: LC.OFFER.ERRORS.GAME_NUMBER_NOT_FOUND})
    }

    if (betItems.length > siteSettings.maxitems) {
      return res.status(400).json({message: LC.OFFER.ERRORS.MAX_ITEMS + siteSettings.maxUserItems});
    }

    let userItemsCount = yield db.JackpotBets.getItemsCount(siteSettings.current_game, userId);
    if (userItemsCount + betItems.length > siteSettings.maxitems) {
      return res.status(400).json({message: LC.OFFER.ERRORS.MAX_ITEMS + siteSettings.maxitems});
    }


    let itemId;
    let betSum = _.sumBy(betItems, 'price');
    betSum = parseFloat(betSum.toFixed(2));

    if (betSum < siteSettings.minbet) {
      return res.status(400).json({message: LC.OFFER.ERRORS.MIN_BET + siteSettings.minBet });
    }

    let gameData = yield db.Games.one(siteSettings.current_game);
    gameData.cost || (gameData.cost = 0);
    gameData.itemsnum || (gameData.itemsnum = 0);

    let itemsFoRemove = [];
    //Формирование массива ставок для записи в БД
    betItems = betItems.map(function (item) {
      let to = gameData.cost + item.price;
      itemsFoRemove.push(item.id);
      let from = parseInt(gameData.cost * 100  + 1);

      gameData.cost = parseFloat(to.toFixed(2));
      gameData.itemsnum++;

      return {
        gameNumber: siteSettings.current_game,
        userId: userId,
        userName: userData.name,
        warehouseId: item.id,
        from: from,
        to: parseInt(to * 100)
      };
    });

    //Проверка началась ли игра
    let gameTime = parseInt(moment(global[config.app.name].jackpotGame.startTime).format('X'));
    let curTime =  parseInt(moment(new Date()).format('X'));

    if (gameTime <=  curTime) {
      return res.status(400).json({message: LC.OFFER.ERRORS.GAME_STARTED});
    }

    let itemsCount = yield db.JackpotBets.getItemsCount(siteSettings.current_game);

    let createdBets = yield db.JackpotBets.addBet(betItems);
    yield db.Warehouse.update({
      ownerId: Sequelize.col('"botId"'),
      forSale: false
    },{
      where: {
        id: {
          $in: itemsFoRemove
        }
      }
    });

    let playersNumber = yield db.JackpotBets.playersNumber(siteSettings.current_game);

    //Обновление данных об игре
    let gameUpdateData = {
      itemsnum: gameData.itemsnum,
      cost: gameData.cost
    };

    global[config.app.name].socket.emit('jackpotGameData', {cost: gameData.cost});
    let startTime = false;

    let timeToGame = playersNumber > 1 && (gameTime > curTime && !global[config.app.name].jackpotGame.gameStarted);
    if (timeToGame) {
      startTime = siteSettings.gameTime;
      global[config.app.name].jackpotGame.startTime = moment(new Date()).add(siteSettings.gameTime, 'second').toDate();
      global[config.app.name].jackpotGame.gameStarted = true;
    }

    yield db.Games.editOld(siteSettings.current_game, gameUpdateData, startTime);

    if (itemsCount >= siteSettings.maxitems) {
      game.choseWinner();
    }

    createdBets = createdBets.map(function(bet) {
      return bet.id;
    })
    result = yield db.JackpotBets.conditionList({
      where: {
        id: {
          $in: createdBets
        }
      },
      include: [
        {
          model: db.User,
          attributes: ['name'],
          include: {
            model: db.UserData,
            attributes: ['avatar']
          }
        },
        {
          model: db.Warehouse,
          attributes: ['name', 'price', 'image']
        }
      ],
      group: [
        '"JackpotBets"."id"',
        '"User"."steamId"',
        '"User"."UserDatum"."steamId"',
        '"Warehouse"."id"'
      ],
      order: '"JackpotBets"."id" DESC'
    });


    result = yield Promise.map(result, function(e) {
      return request.getAsync(e.User.UserDatum.avatar, null)
        .then(function(response) {
          e.User.avatar =  "data:" + response.headers["content-type"] + ";base64," + new Buffer(response.body).toString('base64');
          return e;
        })
    });

    global[config.app.name].socket.emit('newJackpotBet', {
      bets: result,
      gameData: gameData
    });

    if (timeToGame) {
      global[config.app.name].socket.emit('timeToGame', {
        gameTime: siteSettings.gameTime
      });
    }

    res.send(result);
  } catch (err) {
    next(err);
  }
});

module.exports.checkOfferActions = Promise.coroutine(function* (offer) {
  try {
    Promise.promisifyAll(offer);
    yield offer.acceptAsync(); return;

    let userId = offer.partner.getSteamID64();

    let userData = yield db.User.one(userId);

    if (offer.state != 2) {
      return cancelOffer(offer, LC.OFFER.ERRORS.NOT_ECTIVE);
    }
    if (offer.state == 11) {
      return cancelOffer(offer, LC.OFFER.ERRORS.MUST_BE_AUTH);
    }
    if (offer.itemsToGive.length) {
      return cancelOffer(offer, LC.OFFER.ERRORS.ONLY_YOU_ITEMS);
    }

    var info = yield db.Info.list(true);

    if (!info.current_game) {
      throw {
        type: 'appError',
        msg: LC.OFFER.ERRORS.GAME_NUMBER_NOT_FOUND
      }
    }

    let userItems = yield offer.loadPartnerInventoryAsync(config.steam.gameId, config.steam.contextId);

    let item;
    let betSum = 0;

    for (let i = 0; i < offer.itemsToReceive.length; i++) {
      item = offer.itemsToReceive[i];
      //Проверка что бы все элементы ставки были у пользователя в инвентаре
      let currentItems = userItems.filter(function (userItem) {
        return userItem.id == item.id;
      })
      if (!currentItems.length) {
        return cancelOffer(offer, LC.OFFER.ERRORS.ITEM_NOT_FOUND_ON_INVENTORY);
      }
      //Проверка что бы все элементы ставки были из указаной игры
      if (item.appid != config.steam.gameId) {
        return cancelOffer(offer, LC.OFFER.ERRORS.ANOTHER_GAME);
      }
      if (item.market_name.indexOf('Ticket') >= 0) {
        return cancelOffer(offer, LC.OFFER.ERRORS.NOT_PUT_TICKET);
      }
      if (item.market_name.indexOf('Autographed') >= 0) {
        return cancelOffer(offer, LC.OFFER.ERRORS.NOT_MODIFY_ITEMS);
      }

      let itemPrice = null;

      itemPrice = yield db.Items.getSteamItemCost(item.market_name);

      if (itemPrice.type) {
        return cancelOffer(offer, itemPrice);
      }

      item.price = itemPrice;

      betSum += item.price;
    };
    betSum = parseFloat(betSum.toFixed(2));

    if (betSum < info.minbet) {
      return cancelOffer(offer, LC.OFFER.ERRORS.MIN_BET + info.minbet);
    }

    let gameData = yield db.Games.one(info.current_game);
    gameData.cost = parseFloat(gameData.cost);
    gameData.itemsnum = gameData.itemsnum ? gameData.itemsnum : 0;

    let betItems = [];

    //Формирование массива ставок для записи в БД
    offer.itemsToReceive.forEach(function (item) {
      let to = gameData.cost + item.price;

      betItems.push({
        gameNumber: parseInt(info.current_game),
        userId: userId,
        username: userData.name,
        item: item.market_name,
        value: item.price,
        avatar: userData.avatar,
        image: item.icon_url,
        from: gameData.cost * 100  + 1,
        to: to * 100
      });
      gameData.cost = parseFloat(to.toFixed(2));
      gameData.itemsnum++;
    });

    //подтверждение ставки
    yield offer.acceptAsync();

    yield db.JackpotBets.addBet(betItems);

    let playersNumber = yield db.JackpotBets.playersNumber(info.current_game);

    //Обновление данных об игре
    let gameUpdateData = {
      itemsnum: gameData.itemsnum,
      cost: gameData.cost
    };
    console.log(playersNumber);
    let startTime = false;

    //Проверка началась ли игра
    let gameTime = parseInt(moment(global[config.app.name].jackpotGame.startTime).format('X'));
    let curTime =  parseInt(moment(new Date()).format('X'));

    let timeToGame = playersNumber > 1 && (gameTime > curTime);
    if (timeToGame) {
      startTime = info.gameTime;
      global[config.app.name].jackpotGame.startTime = moment(new Date()).add(info.gameTime, 'second').toDate();
      global[config.app.name].jackpotGame.gameStarted = true;
    }

    yield db.Games.editOld(info.current_game, gameUpdateData, startTime);

    let result = yield Promise.map(betItems, function(e) {
      return request.getAsync(e.avatar, null)
        .then(function(response) {
          e.avatar =  "data:" + response.headers["content-type"] + ";base64," + new Buffer(response.body).toString('base64');
          return e;
        })
    });

    gameData.module = sha256(sha256(gameData.module + ''));

    global[config.app.name].socket.emit('newJackpotBet', {
      bets: result,
      gameData: gameData
    });


    if (timeToGame) {
      global[config.app.name].socket.emit('timeToGame', {
        gameTime: info.gameTime
      });
    }

    console.log(LC.OFFER.BET_ACCEPT)

  } catch (err) {
    console.log('Error:' + err)
    EL(err);
  }
});
