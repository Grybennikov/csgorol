(function() {
  'use strict';

  angular
    .module('admin')
    .controller('JackpotBetsController', JackpotBetsController);

  /** @ngInject */
  function JackpotBetsController($translate, customIcons, customDataGrid, JackpotBets) {
    var vm = this;
    var LC = $translate.instant;

    vm.JackpotBets = JackpotBets;

    vm.UI = {
      jackpotBetsGrid: {
        name: 'jackpotBetsGrid',
        onInitialized: function (data) {
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
          dataSource: 'jackpotBets.JackpotBets.store'
        },
        columns: [
          {
            dataField: 'id',
            caption: LC('USERS.GRID_TITLES.ID'),
            allowEdditing: false
          },
          {
            dataField: 'gameNumber',
            sortOrder: 'desc'
          },
          {
            dataField: 'userId',
            caption: 'User steam id'
          },
          {
            dataField: 'Warehouse.name'
          },
          {
            dataField: 'Warehouse.price',
            caption: 'Item cost ($)'
          },
          {
            dataField: 'from',
            caption: 'Tikets from'
          },
          {
            dataField: 'to',
            caption: 'Tikets to'
          }
        ]
      }
    }

  }
})();
