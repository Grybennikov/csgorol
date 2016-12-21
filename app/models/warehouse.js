'use strict';

const Promise = require('bluebird');
const _ = require('lodash');
const coroutine = Promise.coroutine;
var request = Promise.promisify(require('request'));
const config = require('../../config/config');

module.exports = function (sequelize, DataTypes) {
  var Warehouse = sequelize.define('Warehouse', {
    steamId : DataTypes.STRING,
    instanceId: DataTypes.STRING,
    classId : DataTypes.STRING,
    ownerId : DataTypes.STRING,
    botId   : DataTypes.STRING,
    name    : DataTypes.STRING,
    price   : DataTypes.DECIMAL(10, 2),
    image   : DataTypes.STRING,
    forSale : {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    }
  }, {
    tableName: 'warehouse',
    paranoid: true,
    classMethods: {
      associate: function (models) {
        Warehouse.hasMany(models.JackpotBets, {foreignKey: 'warehouseId'});
      },

      add: coroutine(function* (data) {
        let warehouse = yield Warehouse.create(data);
        return warehouse.get({plain: true})
      }),

      addSome: coroutine(function* (data) {
        let warehouse = yield Warehouse.bulkCreate(data, {returning: true});
        return warehouse.map(function(e) {
          return e.get({plain: true})
        })
      }),

      edit: coroutine(function* (id, data) {
        let warehouse = yield Warehouse.update(data, {
          where: {
            id: id
          },
          returning: true
        });
        return warehouse[1][0].get({plain: true});
      }),


      giveUserItems: coroutine(function* (userId, winningItems) {
        let warehouse = yield Warehouse.update({
          ownerId: userId
        }, {
          where: {
            id: {
              $in: winningItems
            }
          },
          returning: true
        });
        return warehouse[1][0].get({plain: true});
      }),

      giveBotItems: coroutine(function* (items) {
        let warehouse = yield Warehouse.update({
          ownerId: sequelize.literal('"botId"')
        }, {
          where: {
            id: {
              $in: items
            }
          },
          returning: true
        });
        return warehouse[1][0].get({plain: true});
      }),

      list: coroutine(function* (condition) {
        let warehouse = yield Warehouse.findAll(condition);
        return warehouse.map(function (w) {
          return w.get({plain: true})
        });
      }),

      botItems: coroutine(function* (withdraw) {
        let where = {
          ownerId: {
            $col: '"Warehouse"."botId"'
          },
          forSale: true
        };
        return yield Warehouse.findAll({where:where});
      }),

      one: coroutine(function* (id) {
        let warehouse = yield Warehouse.findOne({
          where: {
            id: id
          }
        });
        return warehouse.get({plain: true});
      }),

      remove: coroutine(function* (id) {
        let where = {};
        if (_.isArray(id)) {
          where.id = {
            $in: id
          }
        } else {
          where.id = id;
        }
        return yield Warehouse.destroy({
          where: where
        });
      })

    }
  });
  return Warehouse;
};
