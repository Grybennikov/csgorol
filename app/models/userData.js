'use strict';

var Promise = require('bluebird');
var coroutine = Promise.coroutine;

module.exports = function (sequelize, DataTypes) {
  var UserData = sequelize.define('UserData', {
    steamId: {
      type: DataTypes.STRING,
      unique: true,
      notNull: true,
      primaryKey: true
    },
    credits: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },

    totalWins: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    creditsWon: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },

    avatar: DataTypes.STRING,
    tlink: DataTypes.STRING,

    refLink: DataTypes.STRING,

    ban:{
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    ip: DataTypes.STRING,
    lastIp: DataTypes.STRING,
    visitDate: DataTypes.DATE,
    lastVisitDate: DataTypes.DATE
  }, {
    tableName: 'userData',
    classMethods: {
      associate: function (models) {
        UserData.belongsTo(models.User, {
          foreignKey: 'steamId'
        });
      },

      /**
       * Удаляет одного пользователя
       */
      remove: coroutine(function* (steamId) {
        return yield UserData.destroy({
          where: {
            steamId: steamId
          }
        });
      }),
      /**
       * Возвращает данные одного пользователя
       */
      one: coroutine(function* (steamId) {
        let user = yield UserData.findOne({
          where: {
            steamId: steamId
          }
        });
        return user.get({plain: true});
      }),
      /**
       * Создает нового пользвателя и возваращает его данные
       */
      add: coroutine(function* (userData) {
        let user = yield UserData.findOrCreate({
          where: {
            steamId: userData.id
          },
          defaults: {
            steamId: userData.id,
            name: userData.displayName,
            avatar: userData._json.avatarfull,
          }
        });
        userData = user[0].get({plain: true})
        let chatUserDataData =  yield sequelize.models.ChatUserData.add({
          userId: userData.steamId,
          avatar: userData.avatar,
          name: userData.name
        });
        return {
          inserted: user[1],
          userData: userData,
          chatUserDataData: chatUserDataData.userData
        };
      }),
      /**
       * Изменяет данные пользователя
       */
      edit: coroutine(function* (steamId, userData) {
        let user = yield UserData.update(userData, {
          where: {
            steamId: steamId
          },
          returning: true
        });
        return user[1][0].get({plain: true});
      }),

      creditsEdit: coroutine(function* (steamId, credits) {
        let user = yield UserData.update({
          credits:  sequelize.literal('"credits" + ' + credits)
        }, {
          where: {
            steamId: steamId
          },
          returning: true
        });
        return user[1][0].get({plain: true});
      }),
      creditsWonEdit: coroutine(function* (steamId, credits, winGames) {
        let user = yield UserData.update({
          totalWins:  sequelize.literal('"totalWins" + ' + winGames),
          creditsWon: sequelize.literal('"creditsWon" + ' + credits)
        }, {
          where: {
            steamId: steamId
          },
          returning: true
        });
        return user[1][0].get({plain: true});
      }),
      list: coroutine(function* (condition) {
        let user = yield UserData.findAll(condition);
        return user.map(function (user) {
          return user.get({plain: true})
        });
      }),
    }
  });
  return UserData;
};
