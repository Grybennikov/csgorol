(function() {
  'use strict';

  angular
    .module('admin')
    .controller('UsersController', UsersController);

  /** @ngInject */
  function UsersController($translate, customIcons, customDataGrid, Users) {
    var vm = this;
    var LC = $translate.instant;

    vm.Users = Users;
    vm.rowToEditId = null;

    vm.UI = {
      usersGrid: {
        name: 'userGrid',
        onInitialized: function (data) {
          vm.usersGrid = data.component;
          customDataGrid.saveColumnsWidth(data);
        },
        columnAutoWidth: true,
        controlColumnResizing: true,
        hoverStateEnabled: true,
        selection: {
          mode: 'single'
        },
        allowColumnResizing: true,
        filterRow: {
          visible: true
        },
        remoteOperations: false,
        pager: {
          showPageSizeSelector: true,
          allowedPageSizes: [10, 20, 40],
          visible: true,
          showNavigationButtons: true
        },
        bindingOptions: {
          dataSource: 'users.Users.usersStore'
        },
        columns: [
          {
            dataField: 'steamId',
            caption: LC('USERS.GRID_TITLES.STEAM_ID'),
            sortOrder: 'asc',
            allowEdditing: false
          },
          {
            dataField: 'name',
            caption: LC('USERS.GRID_TITLES.NAME')
          },
          {
            dataField: 'tlink',
            caption: LC('USERS.GRID_TITLES.TLINK')
          },
          {
            dataField: 'avatar',
            caption: LC('USERS.GRID_TITLES.AVATAR')
          }
        ],
        onEditingStart: function (data) {
          vm.rowToEditId = data.key.id;
        }
      }
    }

  }
})();
