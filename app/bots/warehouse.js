"use strict";

const Sequelize = require('sequelize');
const Promise = require('bluebird');
const coroutine = Promise.coroutine;
const fsp = require('fs-promise');

const config = require('../../config/config');
const db = require('../models');

const EL = require('../helpers/errorsLog');
const LOG = require('../helpers/errorsLog');

const moment = require('moment');

//пакеты Steam
const SteamUser = require('steam-user');
const Steamcommunity = require('steamcommunity');
const SteamTotp = require('steam-totp');
const TradeOfferManager = require('steam-tradeoffer-manager');

module.exports = function (accountSettings) {
  return {
    start: function () {

      //переменные Steam
      let steamUser = new SteamUser();
      let community = new Steamcommunity();
      let manager = new TradeOfferManager({
        "steam"     : steamUser,
        "domain"    : config.siteDomain,
        "language"  : "en"
      });

      // Steam logon options
      var logOnOptions = {
        "accountName"   : accountSettings.accountName,
        "password"      : accountSettings.password,
        "twoFactorCode" : SteamUser.generateAuthCode(accountSettings.sharedSecret),
        "authCode"      : SteamUser.generateAuthCode(accountSettings.sharedSecret)
      };

      EL.checkLogFile();

      steamUser.logOn(logOnOptions);

      steamUser.on('webSession', webSessionAction);

      manager.on('newOffer', checkOfferActions);


      function checkOfferActions(offer) {
        return Promise.coroutine(function* () {
          try {
            Promise.promisifyAll(offer);
            //console.log('accepted'); return yield offer.acceptAsync();

            var userId = offer.partner.getSteamID64();
            var botId  = steamUser.steamID.getSteamID64();
            yield LOG.saveToFile('Offer ' + offer.id + ' from ' + userId);


            if (offer.state != 2) {
              return cancelOffer(offer, 'Offer, not active!');
            }
            if (offer.state == 11) {
              return cancelOffer(offer, 'You must have 2fa');
            }
            if (offer.itemsToGive.length) {
              return cancelOffer(offer, 'Offer must have only your items');
            }

            //Deposit price
            var depositSum = 0;
            var depositItems = [];
            var anotherGame = false;

            //Each all items in offer
            yield Promise.each(offer.itemsToReceive, function (e) {
              //Check game id
              if (e.appid != config.steam.gameId) {
                anotherGame = true;
              }

              return LOG.saveToFile('Offer ' + offer.id +' from ' + userId + ' item name = ' + e.market_name)
                .then(function(){
                  return db.Items.getSteamLyticsCost(e.market_name);
                })
                .then(function (cost) {
                  if (!isNaN(cost)) {
                    depositSum += cost;
                    depositItems.push({
                      steamId: e.id || e.assetid,
                      instanceId: e.instanceid,
                      classId: e.classid,
                      ownerId: userId,
                      botId: botId,
                      name: e.market_name,
                      price: cost,
                      image: e.icon_url
                    })
                  }
                  return LOG.saveToFile('Offer ' + offer.id + ' from ' + userId + ' item name = ' + e.market_name + ' COST');
                });
            });

            if (anotherGame) {
              return cancelOffer(offer, 'Another game');
            }

            //Accept
            yield LOG.saveToFile('Offer ' + offer.id +' from ' + userId + ' ACCEPTING');
            yield offer.acceptAsync();
            yield LOG.saveToFile('Offer ' + offer.id +' from ' + userId + ' ACCEPTED');

            yield LOG.saveToFile('Offer ' + offer.id +' from ' + userId + ' ADDING TO DB');
            LOG.saveToFile("CURRENT VALUE OF DEPOSIT ARRAYS" + JSON.stringify(depositItems));
            yield db.Warehouse.addSome(depositItems);
            yield LOG.saveToFile('Offer ' + offer.id +' from ' + userId + ' ADDED TO DB');

            console.log('Skins taken');
          } catch (err) {
            EL(err);
          }
        })();
      }

      function webSessionAction(sessionID, cookies) {
        try {
          let botSteamId = steamUser.client.steamID;
          global.warehouseBots[botSteamId] = {};

          manager.setCookies(cookies, (err) => {
            if(err) {
              console.log(err);
              return;
            }

            global.warehouseBots[botSteamId].manager = manager;
          Promise.promisifyAll(global.warehouseBots[botSteamId].manager);
          console.log("Got API key: " + manager.apiKey);
        });

          community.setCookies(cookies);
          community.startConfirmationChecker(30000, accountSettings.identitySecret);
          global.warehouseBots[botSteamId].community = community;
        } catch (err) {
          console.log(err);
        }
      }

      function cancelOffer(offer, msg) {
        return LOG.saveToFile('Offer from ' + steamUser.steamID.getSteamID64() +' rejected' + msg)
          .then(function () {
            return offer.cancelAsync();
          })
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
    }
  }
}
