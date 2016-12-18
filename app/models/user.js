'use strict';

var Promise = require('bluebird');
var coroutine = Promise.coroutine;

module.exports = function (sequelize, DataTypes) {
  var User = sequelize.define('User', {
    steamId: {
      type: DataTypes.STRING,
      unique: true,
      notNull: true,
      primaryKey: true
    },
    name: DataTypes.STRING
  }, {
    tableName: 'users',
    classMethods: {
      associate: function (models) {
        User.hasMany(models.ChatUser, {foreignKey: 'userId'});
        User.hasMany(models.JackpotBets, {foreignKey: 'userId'});
        User.hasOne(models.UserData, {foreignKey: 'steamId'});
      },

      /**
       * Удаляет одного пользователя
       */
      remove: coroutine(function* (steamId) {
        return yield User.destroy({
          where: {
            steamId: steamId
          }
        });
      }),
      /**
       * Возвращает данные одного пользователя
       */
      one: coroutine(function* (steamId) {
        let user = yield User.findOne({
          where: {
            steamId: steamId
          },
          include: {model: sequelize.models.UserData}
        });
        return {
          steamId: user.steamId,
          name: user.name,
          credits: user.UserDatum.credits,
          avatar: user.UserDatum.avatar,
          avatar: user.UserDatum.avatar,
          tlink: user.UserDatum.tlink,
          ban: user.UserDatum.ban,
          refLink: user.UserDatum.refLink
        };
      }),
      /**
       * Создает нового пользвателя и возваращает его данные
       */
      add: coroutine(function* (userData) {
        let avatar  = userData._json.avatarfull;
        let user = yield User.findOrCreate({
          where: {
            steamId: userData.id
          },
          defaults: {
            steamId: userData.id,
            name: userData.displayName
          }
        });

        userData = user[0].get({plain: true});
        userData.avatar = avatar;

        let res = yield Promise.props({
          chatUserData: sequelize.models.ChatUser.add({
            userId: userData.steamId,
            avatar: userData.avatar,
            name: userData.name
          }),
          userData: sequelize.models.UserData.findOrCreate({
            where: {
              steamId: userData.steamId
            },
            defaults: {
              steamId: userData.steamId,
              credits: 0,
              avatar: userData.avatar,
              ban: false
            }
          })
        });

        return {
          inserted: user[1],
          userData: userData,
          chatUserData: res.chatUserData.userData
        };
      }),
      /**
       * Изменяет данные пользователя
       */
      edit: coroutine(function* (steamId, userData) {
        let user = yield User.update(userData, {
          where: {
            steamId: steamId
          },
          returning: true
        });
        return user[1][0].get({plain: true});
      }),

      list: coroutine(function* (condition) {
        let user = yield User.findAll(condition);
        return user.map(function (user) {
          return user.get({plain: true})
        });
      }),

      topPlayers: coroutine(function* () {
        let user = yield User.findAll({
          attributes: ['name', 'steamId'],
          include: [{
            model: sequelize.models.UserData,
            attributes: ['totalWins', 'creditsWon', 'avatar']
          }],
          order: '"UserDatum"."creditsWon" DESC',
          limit: 10
        });
        return user.map(function (user) {
          return user.get({plain: true})
        });
      }),
    }
  });
  return User;
};
