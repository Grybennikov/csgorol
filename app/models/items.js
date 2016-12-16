'use strict';

const Promise = require('bluebird');
const moment = require('moment');
const coroutine = Promise.coroutine;
const request = Promise.promisify(require('request'));
const config = require('../../config/config');

module.exports = function (sequelize, DataTypes) {
  var Items = sequelize.define('Items', {
    name: DataTypes.STRING,
    cost: DataTypes.STRING,
    lastupdate: DataTypes.STRING
  }, {
    tableName: 'items',
    timestamps: false,
    classMethods: {
      /**
       * Create new item
       */
      add: coroutine(function* (userData) {
        let items = yield Items.create(userData);
        return items.get({plain: true})
      }),

      /**
       * Edit item
       */
      edit: coroutine(function* (id, userData) {
        let items = yield Items.update(userData, {
          where: {
           id: id
          },
          returning: true
        });
        return items[1][0].get({plain: true});
      }),

      list: coroutine(function* (condition) {
        let items = yield Items.findAll();
        return items.map(function (items) {
          return items.get({plain: true})
        });
      }),

      one: coroutine(function* (id) {
        let items = yield Items.findOne({
          where: {
            id: id
          }
        });
        return items.get({plain: true});
      }),

      remove: coroutine(function* (id) {
        return yield Items.destroy({
          where: {
            id: id
          }
        });
      }),

      /**
       * Возвращает стоимость предмета c ТП и записывает в БД
       */
      getSteamItemCost: coroutine(function* (itemName) {
        let res = yield  request(encodeURI('http://steamcommunity.com/market/priceoverview/?currency=' + config.steam.currency +
          '&appid=' + config.steam.gameId + '&market_hash_name=' + itemName));
        if (res.statusCode != 200) {
          return {
            type: 'itemNotFound',
            msg: 'Нет такого предмета на ТП'
          };
        }
        let costs = JSON.parse(res.body);
        let itemPrice = costs.lowest_price || costs.median_price;

        switch(config.steam.currency) {
          case 1: {
            itemPrice = itemPrice.replace(/[,]+/g, '.');
            itemPrice = itemPrice.split('$')[1];
            itemPrice = parseFloat(itemPrice);
            break;
          }
          case 5: {
            itemPrice = parseFloat(itemPrice.replace(/[,]+/g, '.'));
            break;
          }
        }

        yield Items.upsert(
          {
            name: itemName,
            cost: itemPrice,
            lastupdate: moment(new Date()).format('x')
          });

        return itemPrice;
      }),
      /**
       * Возвращает стоимость предмета c ДБ или выбираем из Steam
       */
      getDBItemCost: coroutine(function* (itemName) {
        let item = yield Items.findOne({
          where: {name: itemName},
          attributes: ['cost']
        });
        let itemPrice = item ? item.price : item;

        return itemPrice;
      }),
      /**
       * Возвращает элемент для обновления цены
       */
      getItemForUpdate: coroutine(function* (updatingDate) {
        let item = yield Items.findOne({
          where: {
            lastCostUpdate: {
              $lt: new Date(updatingDate)
            }
          },
          attributes: ['name']
        });

        return item ? item.name : item;
      })

    }
  });
  return Items;
};
