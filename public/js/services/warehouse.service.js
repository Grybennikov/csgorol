angular
  .module('gameApp')
  .service('Warehouse', function ($http) {
    var _Warehouse = this;

    var apiUrl = '/api/warehouse/';

    function list() {
      return $http.get(apiUrl)
        .then(function (res) {
          return res.data;
        })
        .catch(function (err) {
          return [];
        });
    }

    function withdraw(items) {
      return $http.post(apiUrl + '/withdraw', {items: items})
        .then(function (res) {
          return res.data;
        })
    }

    _Warehouse.list = list;
    _Warehouse.withdraw = withdraw;

  })
