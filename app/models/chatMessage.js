'use strict';

var Promise = require('bluebird');
var coroutine = Promise.coroutine;

module.exports = function (sequelize, DataTypes) {
  var ChatMessage = sequelize.define('ChatMessage', {
    chatUserId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'chatUsers',
        key: 'userId'
      }
    },
    text: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'chatMessage',
    classMethods: {
      associate: function (models) {
        ChatMessage.belongsTo(models.ChatUser, {
          foreignKey: 'chatUserId'
        });
      },

      /**
       * Добавляет сообщение
       */
      add: coroutine(function* (userData) {
        let chatMessage = yield ChatMessage.create(userData);
        return chatMessage.get({plain: true})
      }),
      /**
       * Выводит данные о всех сообщениях подходящих по дате
       */
      list: coroutine(function* (condition) {
        let chatMessages = yield ChatMessage.findAll({
          include: {
            model: sequelize.models.ChatUser,
            attributes: ['name', 'avatar', 'userId']
          },
          order: '"ChatMessage"."id"'
        });
        return chatMessages.map(function (message) {
          return {
            id: message.id,
            text: message.text,
            avatar: message.ChatUser.avatar,
            name: message.ChatUser.name,
            steamUserId: message.ChatUser.userId
          }
        });
      }),
      /**
       * Выводит данные одного сообщения
       */
      one: coroutine(function* (id) {
        let message = yield ChatMessage.findOne({
          where: {
            id: id
          },
          include: {
            model: sequelize.models.ChatUser,
            attributes: ['name', 'avatar', 'userId']
          }
        });
        return {
          id: message.id,
          text: message.text,
          avatar: message.ChatUser.avatar,
          name: message.ChatUser.name,
          steamUserId: message.ChatUser.userId
        }
      }),
      /**
       * Удаляет одно сообщение
       */
      remove: coroutine(function* (id) {
        return yield ChatMessage.destroy({
          where: {
            id: id
          }
        });
      })
    }
  });
  return ChatMessage;
};
