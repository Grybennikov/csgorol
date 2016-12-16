'use strict';

var Promise = require('bluebird');
var coroutine = Promise.coroutine;

module.exports = function (sequelize, DataTypes) {
  var JackpotBets = sequelize.define('JackpotBets', {
    userId: DataTypes.STRING,
    gameNumber: DataTypes.INTEGER,
    username: DataTypes.STRING,
    item: DataTypes.STRING,
    color: DataTypes.STRING,
    value: DataTypes.DECIMAL(6,3),
    avatar: DataTypes.TEXT,
    image: DataTypes.TEXT,
    from: DataTypes.INTEGER,
    to: DataTypes.INTEGER
  }, {
    tableName: 'jackpotBets',
    timestamps: false,
    classMethods: {
      associate: function (models) {
        JackpotBets.belongsTo(models.Games, {
          foreignKey: 'gameNumber'
        });
      },

      conditionList: coroutine(function* (condition) {
        let jackpotBets = yield JackpotBets.findAll(condition);
        return jackpotBets.map(function (jb) {
          return jb.get({plain: true})
        });
      }),

      list: coroutine(function* (betId, gameNumber) {
        let where = {};
        if (betId && gameNumber) {
          where = {
            gameNumber: gameNumber,
            id: {
              $gt: betId || 0
            }
          }
        }
        if (!betId && gameNumber) {
          where = {
            gameNumber: gameNumber
          }
        }
        let bets = yield JackpotBets.findAll({
          where: where,
          order: 'id DESC'
        });
        return bets.map(function (bet) {
          return bet.get({plain: true})
        });
      }),
      /**
       * Возвращает количство предметов в игре
       * если указан userId то дл одного игрока
       */
      getItemsCount: coroutine(function* (gameNumber, userId) {
        let queryConfig = {where: {}};
        if (gameNumber) {
          queryConfig.where.gameNumber = gameNumber;
        } else {
          throw {
            type: 'system',
            msg: 'gameNumber в userItemsCount не был найден'
          }
        }
        userId && (queryConfig.where.userId = userId);

        let itemsCount = yield JackpotBets.count(queryConfig);
        return itemsCount;
      }),
      /**
       * Добавлет элементы ставки в таблицу
       */
      addBet: coroutine(function* (betItems) {
        let result = yield JackpotBets.bulkCreate(betItems, {returning: true});
        return result;
      }),
      /**
       * Выбирает количество игроков в игре
       */
      playersNumber: coroutine(function* (gameNumber) {
        let result = yield sequelize.query('SELECT  count(distinct userid) AS "count" FROM "jackpotGames" AS "Bets" WHERE "Bets"."gameNumber" = ' + gameNumber);
        return parseInt(result[0][0].count);
      }),
      getWinningBet: coroutine(function* (gameNumber, winningNumber) {

        let winningBet = yield JackpotBets.findOne({
          where: {
            gameNumber: gameNumber,
            $and: [
              sequelize.where(sequelize.literal(winningNumber), {
                $between: [
                  sequelize.col('JackpotBets.from'),
                  sequelize.col('JackpotBets.to')
                ]
              })
            ]
          }
        });

        return winningBet.get({plain: true});

      })
    }
  });
  return JackpotBets;
};

