(function() {
  'use strict';

  angular
    .module('admin')
    .controller('JackpotGamesController', JackpotGamesController);

  /** @ngInject */
  function JackpotGamesController($translate, customIcons, customDataGrid, JackpotGames) {
    var vm = this;
    var LC = $translate.instant;

    vm.JackpotGames = JackpotGames;

    vm.UI = {
      jackpotGamesGrid: {
        name: 'jackpotGamesGrid',
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
        editing: {
          editEnabled: true
        },
        remoteOperations: false,
        pager: {
          showPageSizeSelector: true,
          allowedPageSizes: [10, 20, 40],
          visible: true,
          showNavigationButtons: true
        },
        bindingOptions: {
          dataSource: 'jackpotGames.JackpotGames.store'
        },
        columns: [
          {
            dataField: 'id',
            sortOrder: 'desc'
          },
          {
            dataField: 'startTime'
          },
          {
            dataField: 'winner'
          },
          {
            dataField: 'userId',
            caption: 'Winner steam id'
          },
          {
            dataField: 'percent'
          },
          {
            dataField: 'itemsnum'
          },
          {
            dataField: 'cost',
            caption: 'Game pot'
          },
          {
            dataField: 'module',
            caption: 'Rundom nuber'
          }
        ]
      }
    }

  }
})();
