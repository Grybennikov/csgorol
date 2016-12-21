"use strict";

const path = require('path');
const Promise = require('bluebird');
const _ = require('lodash');
const db = require('../models');
const config = require('../../config/config');

//пакеты Steam
const SteamUser = require('steam-user');
const Steamcommunity = require('steamcommunity');
const SteamTotp = require('steam-totp');
const TradeOfferManager = require('steam-tradeoffer-manager');



/**
 * Returns list of warehouse items
 */
module.exports.listAction = Promise.coroutine(function* (req, res, next) {
  try {
    let result = null;

    if (req.session.isAdmin) {
      result = yield db.Warehouse.list();
    } else {
      result = yield db.Warehouse.list({
        where: {
          ownerId: req.user.id
        }
      });
    }
    res.send(result);
  } catch (err) {
    next(err);
  }

});

/**
 * Withdraw items
 */
module.exports.withdrawAction = Promise.coroutine(function* (req, res, next) {
  try {
    let steamId = req.user.userData.steamId;

    let siteSettings = yield db.Info.list(true);
    //if (!siteSettings.withdrawEnabled) {
    //  return res.send({status: 'error', msg: 'Withdraw disabled'});
    //}

    let token = req.user.userData.tlink ? req.user.userData.tlink.split('token=')[1] : false;
    if (!token) {
      return res.status(400).send({status: 'error', msg: 'Please provide a trade link'});
    }

    let itemsToGive = req.body.items;

    if (!itemsToGive.length) {
      return res.status(400).send({status: 'error', msg: 'Select the skins'});
    }

    //Фильтр на пренадлежание пользователю

    itemsToGive = yield db.Warehouse.list({
      where: {
        steamId: {
          $in: itemsToGive
        },
        ownerId: steamId
      }
    });

    let manager = global.warehouseBots[itemsToGive[0].botId].manager;

    let inventoryItems = yield manager.loadInventoryAsync(config.steam.gameId, config.steam.contextId, true);
    inventoryItems = yield Promise.map(inventoryItems, function (e) {
      return {
        id: e.id,
        name: e.name,
        amount: e.amount,
        marketName: e.market_name,
        marketHashName: e.market_hash_name,
        assetId: e.assetid,
        img: e.icon_url + '/70fx50f',
        appid: e.appid,
        contextid: e.contextid,
        assetid: e.assetid
      }
    });

    //Формирование списка на выдачу
    let itemIndex = null;
    let itemsCost = 0;
    let itemsForOffer = [];
    itemsToGive.forEach(function (e) {
      itemIndex = -1
      itemIndex = _.findLastIndex(inventoryItems, function (ie) {
        return ie.marketHashName == e.name
      });
      if (itemIndex != -1) {
        inventoryItems[itemIndex].dbId = e.id;
        itemsForOffer.push(inventoryItems[itemIndex]);
        inventoryItems.splice(itemIndex, 1);
      }
    });

    itemsToGive = itemsForOffer;

    if (itemsToGive.length == 0) {
      return res.status(400).send({status: 'error', msg: 'Sorry, skins not found. Reload inventory and try again'});
    }

    let offer = manager.createOffer(new TradeOfferManager.SteamID(steamId), token);
    Promise.promisifyAll(offer);

    offer.addMyItems(itemsToGive);
    offer.setMessage('Skins from ' + config.siteName);

    itemsToGive = itemsToGive.map(function(e) {
      return e.dbId;
    });
    yield db.Warehouse.remove(itemsToGive);

    let pending = yield offer.sendAsync();

    if (pending === 'pending') {
      return res.send({status: 'success', msg: 'pending'});
    } else {
      return res.status(400).send({status: 'error', msg: 'error'});
    }


  } catch (err) {
    next(err);
  }

});

module.exports.adminWithdraw = Promise.coroutine(function* (req, res, next) {
  try {
    let link = req.body.link;

    //Фильтр на пренадлежание пользователю

    let itemsToGive = yield db.Warehouse.botItems();

    let manager = global.warehouseBots[itemsToGive[0].botId].manager;

    let inventoryItems = yield manager.loadInventoryAsync(config.steam.gameId, config.steam.contextId, true);
    inventoryItems = yield Promise.map(inventoryItems, function (e) {
      return {
        id: e.id,
        name: e.name,
        amount: e.amount,
        marketName: e.market_name,
        marketHashName: e.market_hash_name,
        assetId: e.assetid,
        img: e.icon_url + '/70fx50f',
        appid: e.appid,
        contextid: e.contextid,
        assetid: e.assetid
      }
    });

    //Формирование списка на выдачу
    let itemIndex = null;
    let itemsCost = 0;
    let itemsForOffer = [];
    itemsToGive.forEach(function (e) {
      itemIndex = -1
      itemIndex = _.findLastIndex(inventoryItems, function (ie) {
        return ie.marketHashName == e.name
      });
      if (itemIndex != -1) {
        inventoryItems[itemIndex].dbId = e.id;
        itemsForOffer.push(inventoryItems[itemIndex]);
        inventoryItems.splice(itemIndex, 1);
      }
    });

    itemsToGive = itemsForOffer;

    if (itemsToGive.length == 0) {
      return res.status(400).send({status: 'error', msg: 'Sorry, skins not found.'});
    }

    let offer = manager.createOffer(link);
    Promise.promisifyAll(offer);

    offer.addMyItems(itemsToGive);
    offer.setMessage('Skins from ' + config.siteName);

    itemsToGive = itemsToGive.map(function(e) {
      return e.dbId;
    });
    yield db.Warehouse.remove(itemsToGive);

    let pending = yield offer.sendAsync();

    if (pending === 'pending') {
      return res.send({status: 'success', msg: 'pending'});
    } else {
      return res.status(400).send({status: 'error', msg: 'error'});
    }


  } catch (err) {
    next(err);
  }

});
