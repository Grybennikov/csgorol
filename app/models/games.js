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
    module: DataTypes.STRING,
    ticket: DataTypes.INTEGER
  }, {
    tableName: 'games',
    classMethods: {
      associate: function (models) {
        Games.belongsTo(models.User, {
          foreignKey: 'userId'
        });
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

      one: coroutine(function* (number, usersData) {
        let condition = {
          where: {
            id: number
          },
          include: {
            model: sequelize.models.JackpotBets
          }
        }

        if (usersData) {
          condition.include.include =  {
            model: sequelize.models.User,
            include: {model: sequelize.models.UserData}
          };
        }

        let games = yield Games.findOne(condition);
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
      }),

      history: coroutine(function* () {
        let siteSettings = yield sequelize.models.Info.list(true);
        let jackpotGames = yield Games.findAll({
          where: {
            id: {
              $not: siteSettings.current_game
            }
          },
          include: [{
            model: sequelize.models.JackpotBets,
            attributes: ['warehouseId'],
            include: {
              model: sequelize.models.Warehouse,
              attributes: ['name', 'price', 'image']
            }
          }, {
            model: sequelize.models.User,
            attributes: ['steamId'],
            include: {
              model: sequelize.models.UserData,
              attributes: ['avatar']
            }
          }],
          order: '"id" DESC',
          limit: 10
        });
        return jackpotGames.map(function (jackpotGames) {
          return jackpotGames.get({plain: true})
        });
      })

    }
  });
  return Games;
};
