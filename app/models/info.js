'use strict';

var Promise = require('bluebird');
var coroutine = Promise.coroutine;
var _ = require('lodash');

module.exports = function (sequelize, DataTypes) {
  var Info = sequelize.define('Info', {
    name: {
      type: DataTypes.STRING,
      unique: true,
      notNull: true,
      primaryKey: true
    },
    value: DataTypes.STRING
  }, {
    tableName: 'info',
    timestamps: false,
    classMethods: {
      /**
       * Create new item
       */
      add: coroutine(function* (userData) {
        let info = yield Info.create(userData);
        return info.get({plain: true})
      }),

      /**
       * Edit item
       */
      edit: coroutine(function* (name, data) {
        let info = yield Info.update(data, {
          where: {
           name: name
          },
          returning: true
        });
        return info[0];
      }),

      /**
       * Edit by name
       */
      editByName: coroutine(function* (name, value) {
        let info = yield Info.update({value: value}, {
          where: {
            name: name
          },
          returning: true
        });
        return info[1][0] ? info[1][0].get({plain: true}) : info;
      }),

      list: coroutine(function* (toObject) {
        let info = yield Info.findAll();
        info = info.map(function (info) {
          return info.get({plain: true});
        });

        if (toObject) {
          info = _.zipObject(
            _.map(info, function (item) {
              return item.name
            }),
            _.map(info, function (item) {
              if (item.value == 'true') {
                return true
              }
              if (item.value == 'false') {
                return false
              }

              if (isNaN(parseFloat(item.value))) {
                return item.value
              } else {
                return parseFloat(item.value)
              }
            })
          );
        }

        return info;
      }),

      one: coroutine(function* (id) {
        let info = yield Info.findOne({
          where: {
            id: id
          }
        });
        return info.get({plain: true});
      }),

      remove: coroutine(function* (id) {
        return yield Info.destroy({
          where: {
            id: id
          }
        });
      }),

    }
  });
  return Info;
};
