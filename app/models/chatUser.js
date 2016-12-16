'use strict';

var Promise = require('bluebird');
var coroutine = Promise.coroutine;

module.exports = function (sequelize, DataTypes) {
  var ChatUser = sequelize.define('ChatUser', {
    userId: {
      type: DataTypes.STRING,
      unique: true,
      notNull: true,
      primaryKey: true
    },
    name: DataTypes.STRING,
    avatar: DataTypes.STRING,
    ban: DataTypes.DATE

  }, {
    tableName: 'chatUsers',
    classMethods: {
      associate: function (models) {
        ChatUser.belongsTo(models.User, {
          foreignKey: 'userId'
        });

        ChatUser.hasMany(models.ChatMessage, {
          foreignKey: 'chatUserId'
        });
      },

      /**
       * Создает нового пользвателя чата и возваращает его данные
       */
      add: coroutine(function*(userData) {
        let chatUser = yield ChatUser.findOrCreate({
          where: {
            userId: userData.userId
          },
          defaults: {
            userId: userData.userId,
            avatar: userData.avatar,
            name: userData.name,
            steamUserId: userData.steamId,
          }
        });
        return {
          inserted: chatUser[1],
          userData: chatUser[0].get({plain: true})
        }
      }),
      /**
       * Выводит данные об одном пользователе чата
       */
      one: coroutine(function* (id) {
        let chatUser = yield ChatUser.find({
          where: {
            id: id
          }
        });
        return chatUser.get({plain: true})
      }),
      /**
       * Выводит данные о всех пользователях чата
       */
      list: coroutine(function* (condition) {
        let chatUsers = yield ChatUser.findAll();
        return chatMessages.map(function (chatMessage) {
          return chatMessage.get({plain: true})
        });
      }),
      /**
       * Удаляет пользователя чата
       */
      remove: coroutine(function* (id) {
        return yield ChatUser.destroy({
          where: {
            id: id
          }
        });
      })

    }
  })
  return ChatUser;
};
