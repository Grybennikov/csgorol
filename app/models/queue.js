'use strict';

var Promise = require('bluebird');
var coroutine = Promise.coroutine;

module.exports = function(sequelize, DataTypes) {
  var Queue = sequelize.define('Queue', {
    gameNumber: DataTypes.INTEGER,
    userId: DataTypes.STRING,
    token: DataTypes.STRING,
    items: DataTypes.STRING,
    status: DataTypes.STRING
  }, {
    tableName: 'queue',
    timestamps: false,
    classMethods: {
      /**
       * Create new queue
       */
      add: coroutine(function* (data) {
        data.status || (data.status = 'empty');
        let queue = yield Queue.create(data);
        return queue.get({plain: true});
      }),

      /**
       * Edit queue
       */
      edit: coroutine(function* (id, userData) {
        let queue = yield Queue.update(userData, {
          where: {
            id: id
          },
          returning: true
        });
        return queue[1][0].get({plain: true});
      }),

      list: coroutine(function* (condition) {
        let queue = yield Queue.findAll(condition);
        return queue.map(function (queue) {
          return queue.get({plain: true})
        });
      }),

      one: coroutine(function* (id) {
        let queue = yield Queue.findOne({
          where: {
            id: id
          }
        });
        return queue.get({plain: true});
      }),

      remove: coroutine(function* (id) {
        return yield Queue.destroy({
          where: {
            id: id
          }
        });
      })

    }
  });
  return Queue;
};
