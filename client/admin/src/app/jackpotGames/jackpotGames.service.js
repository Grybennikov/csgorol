(function() {
  'use strict';

  angular
    .module('admin')
    .service('JackpotGames', JackpotGames);

  /** @ngInject */
  function JackpotGames($log, $http, $window, $translate, ErrorMessages) {

    var _JackpotGames = this;
    var LC = $translate.instant;

    /**
     * DataStore for accessing to user list
     * @type {DevExpress.data.CustomStore}
     */
    var store = new $window.DevExpress.data.CustomStore({
      totalCount: function () {
        return 0;
      },
      load: function() {
        return list();
      },
      update: function(oldData, newData) {
        return edit(oldData, newData)
      },
    });

    /**
     * Function makes request to back-end for user list
     * @returns {*}
     */
    function list(current) {
      return $http.get('/api/jackpotGames', {
          params: {
            current: current
          }
        })
        .then(function (res) {
          return res.data;
        })
        .catch(function (err) {
          ErrorMessages.process(err);
          return [];
        });
    }

    function edit (data, updatedData) {
      return $http.put('/api/jackpotGames/' + encodeURIComponent(data.id), updatedData)
        .then(function (res) {
          $window.DevExpress.ui.notify(LC('COMMON.SUCCESS.UPDATE'), "success", 1000);
          return res.data;
        })
        .catch(function(err) {
          ErrorMessages.process(err);
        });
    }


    _JackpotGames.store = store;
    _JackpotGames.list = list;
    _JackpotGames.edit = edit;
  }
})();
