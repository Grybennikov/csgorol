"use strict";

const Sequelize = require('sequelize');
const Promise = require('bluebird');
const coroutine = Promise.coroutine;
const fsp = require('fs-promise');

const config = require('../../config/config');
const db = require('../models');

const EL = require('../helpers/errorsLog');

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
            //return yield offer.acceptAsync();

            let userId = offer.partner.getSteamID64();
            let botId  = steamUser.steamID.getSteamID64();

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
            let depositSum = 0;
            let depositItems = [];
            let anotherGame = false;

            //Each all items in offer
            yield Promise.each(offer.itemsToReceive, function (e) {
              //Check game id
              if (e.appid != config.steam.gameId) {
                anotherGame = true;
              }

              return db.Items.getSteamItemCost(e.market_name)
                .then(function (cost) {
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
                  return cost;
                });
            });

            if (anotherGame) {
              return cancelOffer(offer, 'Another game');
            }

            //Accept
            yield offer.acceptAsync();

            yield db.Warehouse.addSome(depositItems);

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
    }
  }
}
