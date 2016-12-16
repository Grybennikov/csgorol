(function() {
  'use strict';

  angular
    .module('admin')
    .service('Users', Users);

  /** @ngInject */
  function Users($log, $http, $window, $translate, ErrorMessages) {

    var _Users = this;
    var LC = $translate.instant;

    /**
     * DataStore for accessing to user list
     * @type {DevExpress.data.CustomStore}
     */
    var usersStore = new $window.DevExpress.data.CustomStore({
      totalCount: function () {
        return 0;
      },
      load: function() {
        return listUser();
      },
      update: function(oldData, newData) {
        return editUser(oldData, newData)
      },
      remove: function (data) {
        return removeUser(data.steamId);
      }
    });

    /**
     * Function makes request to back-end for user list
     * @returns {*}
     */
    function listUser() {
      return $http.get('/api/user')
        .then(function (res) {
          return res.data;
        })
        .catch(function (err) {
          ErrorMessages.process(err);
          return [];
        });
    }

    /**
     * Function makes request to back-end for update user
     * @param userData
     * @param updatedUserData
     * @returns {*}
     */
    function editUser (userData, updatedUserData) {
      return $http.put('/api/user/' + encodeURIComponent(userData.steamId), updatedUserData)
        .then(function (res) {
          $window.DevExpress.ui.notify(LC('COMMON.SUCCESS.UPDATE'), "success", 1000);
          return res.data;
        })
        .catch(function(err) {
          ErrorMessages.process(err);
        });
    }

    /**
     * Function makes request to back-end for add user
     * @param userData
     * @returns {*}
     */
    function addUser(userData) {
      return $http.post('/api/user', userData)
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
     * Function makes request to back-end for remove user
     * @param employeeId
     * @returns {*}
     */
    function removeUser(userId) {
      return $http.delete('/api/user/' + encodeURI(userId))
        .then(function (res) {
          return res.data;
        })
        .catch(function (err) {
          ErrorMessages.process(err);
        });
    }

    _Users.usersStore = usersStore;
    _Users.list = listUser;
    _Users.add = addUser;
    _Users.edit = editUser;
    _Users.remove = removeUser;
  }
})();
