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
     * Function makes request to back-end for update item
     * @param itemData
     * @param updatedItemData
     * @returns {*}
     */
    function editItem (itemData, updatedItemData) {
      return $http.put('/api/item/' + encodeURIComponent(itemData.id), updatedItemData)
        .then(function (res) {
          $window.DevExpress.ui.notify(LC('COMMON.SUCCESS.UPDATE'), "success", 1000);
          return res.data;
        })
        .catch(function(err) {
          ErrorMessages.process(err);
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

    /**
     * Function makes request to back-end for remove item
     * @param employeeId
     * @returns {*}
     */
    function removeItem(id) {
      return $http.delete('/api/item/' + encodeURI(id))
        .then(function (res) {
          return res.data;
        })
        .catch(function (err) {
          ErrorMessages.process(err);
        });
    }

    _Items.itemsStore = itemsStore;
    _Items.list = listItem;
    _Items.add = addItem;
    _Items.edit = editItem;
    _Items.remove = removeItem;
  }
})();
