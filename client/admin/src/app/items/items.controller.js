(function() {
  'use strict';

  angular
    .module('admin')
    .controller('ItemsController', ItemsController);

  /** @ngInject */
  function ItemsController($translate, customIcons, customDataGrid, Items) {
    var vm = this;
    var LC = $translate.instant;

    vm.Items = Items;
    vm.rowToEditId = null;


    vm.UI = {
      itemsGrid: {
        name: 'itemsGrid',
        onInitialized: function (data) {
          vm.itemsGrid = data.component;
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
          dataSource: 'items.Items.itemsStore'
        },
        columns: [
          {
            dataField: 'id',
            caption: LC('ITEMS.GRID_TITLES.ID'),
            sortOrder: 'asc',
            allowEditing: false
          },
          {
            dataField: 'name',
            caption: LC('ITEMS.GRID_TITLES.NAME')
          },
          {
            dataField: 'cost',
            caption: LC('ITEMS.GRID_TITLES.PRICE')
          }

        ],
        onEditingStart: function (data) {
          vm.rowToEditId = data.key.id;
        }
      }
    }

  }
})();
