(function() {
  'use strict';

  angular
    .module('admin')
    .service('JackpotBets', JackpotBets);

  /** @ngInject */
  function JackpotBets($log, $http, $window, $translate, ErrorMessages) {

    var _JackpotBets = this;
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
      }
    });

    /**
     * Function makes request to back-end for user list
     * @returns {*}
     */
    function list(current) {
      return $http.get('/api/jackpotBets', {
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


    _JackpotBets.store = store;
    _JackpotBets.list = list;
  }
})();
