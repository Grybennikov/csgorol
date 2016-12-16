
"use strict";

const Promise = require('bluebird');
const db = require('../models');
const config = require('../../config/config');
const jackpotGame = require('./jackpotGames');
const EL = require('../helpers/errorsLog');
const _ = require('lodash');
const moment = require('moment');
const sha256 = require('sha256');
const LC = require('../i18n');
var request = require('request').defaults({ encoding: null });
Promise.promisifyAll(request);

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
    gameData.itemsAmount = gameData.itemsnum ? gameData.itemsnum : 0;

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
      gameData.itemsAmount++;
    });

    //подтверждение ставки
    yield offer.acceptAsync();

    yield db.JackpotBets.addBet(betItems);

    let playersNumber = yield db.JackpotBets.playersNumber(info.current_game);

    //Обновление данных об игре
    let gameUpdateData = {
      itemsnum: gameData.itemsAmount,
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


function cancelOffer(offer, msg) {
  console.log('Cancel offer:' + msg)
  offer.cancelAsync()
    .then(function (err) {
      if (err) {
        EL(err);
      }
      EL({
        userId: offer.partner.getSteamID64(),
        msg: msg,
        type: 'offerRejected'
      });
    });
}
