(function() {
  'use strict';

  angular
    .module('admin')
    .service('Items', Items);

  /** @ngInject */
  function Items($log, $http, $window, $translate, ErrorMessages) {

    var _Items = this;
    var LC = $translate.instant;

    /**
     * DataStore for accessing to item list
     * @type {DevExpress.data.CustomStore}
     */
    var itemsStore = new $window.DevExpress.data.CustomStore({

      totalCount: function () {
        return 0;
      },
      load: function() {
        return listItem();
      },
      insert: function(data) {
        return addItem(data);
      },
      update: function(oldData, newData) {
        return editItem(oldData, newData)
      },
      remove: function (data) {
        return removeItem(data.id);
      }
    });

    /**
     * Function makes request to back-end for item list
     * @returns {*}
     */
    function listItem() {
      return $http.get('/api/item')
        .then(function (res) {
          return res.data;
        })
        .catch(function (err) {
          ErrorMessages.process(err);
          return [];
        });
    }

    /**
     * Function makes request to back-end for add item
     * @param itemData
     * @returns {*}
     */
    function addItem(itemData) {
      return $http.post('/api/item', itemData)
        .then(function (res) {
          $window.DevExpress.ui.notify(LC('COMMON.SUCCESS.ADD'), "success", 1000);
         return res.data;
        })
        .catch(function (err) {
          ErrorMessages.process(err);
          return err;
        });
    }

    _Items.itemsStore = itemsStore;
    _Items.list = listItem;
    _Items.add = addItem;
  }
})();
