'use strict';

var Promise = require('bluebird');
var coroutine = Promise.coroutine;
var moment = require('moment');

module.exports = function (sequelize, DataTypes) {
  var Games = sequelize.define('Games', {
    startTime: {
      type: DataTypes.INTEGER,
      defaultValue: 2147483647
    },
    cost: {
      type: DataTypes.DECIMAL(10,2),
      defaultValue: 0
    },
    winner: DataTypes.STRING,
    userId: DataTypes.STRING,
    percent: {
      type: DataTypes.DECIMAL(10,2),
      defaultValue: 0
    },
    itemsnum: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    module: DataTypes.STRING
  }, {
    tableName: 'games',
    timestamps: false,
    classMethods: {
      associate: function (models) {
        Games.hasMany(models.JackpotBets, {
          foreignKey: 'gameNumber'
        });
      },

      /**
       * Create new item
       */
      add: coroutine(function* (gameData) {
        let games = yield Games.create(gameData);
        return games.get({plain: true})
      }),

      /**
       * Edit item
       */
      edit: coroutine(function* (id, userData, number) {
        let where = {};
        id && (where.id = id);
        number && (where.id = number);
        let games = yield Games.update(userData, {
          where: where,
          returning: true
        });
        return games;
      }),

      editOld: coroutine(function* (number, gameData, startTime) {
        if (startTime) {
          gameData.starttime = moment().add(startTime, 'second').format('x')
        }
        let response = yield Games.update(gameData, {
          where: {
            id: number
          }
        });
        return response;
      }),

      list: coroutine(function* (condition) {
        let games = yield Games.findAll(condition);
        return games.map(function (games) {
          return games.get({plain: true})
        });
      }),

      one: coroutine(function* (number) {
        let games = yield Games.findOne({
          where: {
            id: number
          },
          include: {
            model: sequelize.models.JackpotBets
          }
        });
        games = games.get ? games.get({plain: true}) : {};
        games.cost = games.cost ? parseFloat(games.cost) : 0;
        return games;
      }),

      remove: coroutine(function* (id) {
        return yield Games.destroy({
          where: {
            id: id
          }
        });
      }),

      cost: coroutine(function* () {
        return  yield Games.sum('cost');
      })

    }
  });
  return Games;
};
