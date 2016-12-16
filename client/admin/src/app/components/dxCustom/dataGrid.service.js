(function () {
  'use strict';

  angular
    .module('dxCustom')
    .service('customDataGrid', customDataGrid);

  /** @ngInject */
  function customDataGrid($localStorage) {
    /**
     * Function for create grouping in DataGrid
     * @param gridElement
     * @param columnGroups
     * @description
     * !!! All grouping columns must have allowResizing: false
     * Created additional header(main-header) copy all elements(td) from dx-header(tr), set rowspan=2(for non grouped items)
     * and using first element in group.columns array as group column(with colspan = group.columns count)
     * and hide other columns in this group(in main-header).
     * Group elements visible in dx-header but not display in main-header.
     * You must add css class to column with his data field name
     *
     * dxDataGrid header structure:
     * <div class="dx-datagrid-content dx-datagrid-scroll-container">
     <table class="dx-datagrid-table dx-datagrid-table-fixed" role="grid">
     <tbody>
     <tr class="dx-row dx-column-lines dx-header-row main-header" role="row"
     id="[grid-id]-header">
     <td role="columnheader" class="code dx-cell-focus-disabled" aria-label="" style="text-align: left;"
     rowspan="2">&nbsp;</td>
     </tr>
     <tr class="dx-row dx-column-lines dx-header-row" role="row">
     <td role="columnheader" class="code dx-cell-focus-disabled datagrid-group-unused" aria-label=""
     style="text-align: left;">&nbsp;</td>
     </tr>
     </tbody>
     </table>
     </div>
     * @example
     * customDataGrid(grid.element, [
     *  {
     *    name: 'groupName',
     *    title: 'group Title',
     *    columns: [
     *      'column1',
     *      'column2'
     *    ]
     *  }
     * ])
     */
    this.createGroups = function (gridElement, columnGroups) {
      var query = angular.element;
      var grid = gridElement._$element[0];
      var headerId = grid.id + '-header';
      var fixedHeaderId = grid.id + '-fixedHeader';
      var groupTemplate = '<td class="dx-datagrid-action dx-cell-focus-disabled group" style="text-align: center;" aria-sort="none"></td>'

      var headBlocks = query(grid).find('.dx-datagrid-headers tbody');
      var fixedHeader = headBlocks[1] ? query(headBlocks[0]) : false;
      var header = headBlocks[1] ? query(headBlocks[1]) : query(headBlocks[0]);

      /*If main headers is created, exiting*/
      if (query('#' + headerId).length !== 0) return;

      /*Create main headers. If using fixed columns, creating fixedMainHeader*/
      createMainHeader(header, headerId);
      if (fixedHeader) {
        createMainHeader(fixedHeader, fixedHeaderId, true);
      }

      var headerRows = header.find('tr');
      var oldHeader = query(headerRows[1]).find('td');
      var newHeader = query(headerRows[0]);
      var groupedColumnsCount = {};

      for (var k = 0; k < columnGroups.length; k++) {
        groupedColumnsCount[columnGroups[k].name] = 0;
      }

      for (var i = 0; i < oldHeader.length; i++) {
        var oldItem = query(oldHeader[i]);
        var group = checkGroup(columnGroups, oldItem);

        /* If column not in a group.columns array - just copy td from dx-header to main-header
         * Else - call createGroup function for create a group-column*/
        if (!group) {
          createItem(newHeader, oldItem);
        } else {
          var groupItemId = group.name + '-' + Math.random().toString(36).substring(7);
          oldItem.attr('data-id', groupItemId);
          createGroup(newHeader[0], group, groupItemId);
        }
      }

      /*Set colspan = group columns count for all group column(in main-header)*/
      for (var groupC = 0; groupC < columnGroups.length; groupC++) {
        newHeader.find('.' + columnGroups[groupC].name).attr('colspan', groupedColumnsCount[columnGroups[groupC].name]).on('click', function (e) {
          e.preventDefault();
          return false;
        });
      }

      /*Correction height for fixed tr*/
      if (fixedHeader) {
        var fixTr = fixedHeader.find('.dx-header-row');
        var notFixedHeaderTr = header.find('tr');
        if (notFixedHeaderTr.length === 3) {
          query(fixTr[0]).height(query(notFixedHeaderTr[0]).height());
          query(fixTr[1]).height(query(notFixedHeaderTr[1]).height());
          query(fixTr[2]).height(query(notFixedHeaderTr[2]).height());
        }
      }
      addSortEvents();

      /**
       * Function for add events on DOMChange for move dx-indicators from first tr(main-header) to dx-header
       */
      function addSortEvents() {
        query('.group')
          .bind('DOMSubtreeModified', function () {
            var sort = query(this).attr('aria-sort');
            var sortElement = query(this).find('.dx-column-indicators');
            var groupId = query(this).attr('data-id');

            var originElement = query(query('td[data-id="' + groupId + '"')[1]);
            if (originElement.find('.dx-sort').length === 0) originElement.prepend(sortElement.clone());
            var originSortElement = originElement.find('.dx-sort');

            if (sort === 'ascending') {
              originSortElement.addClass('dx-sort-up');
              originSortElement.removeClass('dx-sort-down');
            }
            if (sort === 'descending') {
              originSortElement.addClass('dx-sort-down');
              originSortElement.removeClass('dx-sort-up');
            }
            originElement.attr('aria-sort', sort);
            sortElement.hide();
          })
          .bind('DOMNodeRemoved', function () {
            var groupId = query(this).attr('data-id');
            var originElement = query(query('td[data-id="' + groupId + '"')[1]);
            originElement.find('.dx-column-indicators').remove();
          });
      }

      /**
       * Function for create a additional tr in dx-header
       * @param head
       * @param id
       * @param notPurge
       */
      function createMainHeader(head, id, notPurge) {
        var origin = query(head.find('tr')[0]);
        var main = query(origin).clone(true);

        query(main).addClass('main-header');
        query(main).attr('id', id);

        if (notPurge) {
          var originColumns = origin.find('td');
          var mainColumns = main.find('td');
          query(originColumns).addClass('datagrid-group-unused');
          query(mainColumns).attr('rowspan', 2);
        } else query(main).empty();

        head.prepend(main);
      }

      /**
       * Function for clone element from dx-header to main-header
       * @param header
       * @param oldItem
       */
      function createItem(header, oldItem) {
        var newElement = oldItem.clone(true);

        oldItem.addClass('datagrid-group-unused');
        oldItem.off('click');
        newElement.attr('rowspan', 2);

        query(header[0]).append(newElement);
      }

      /**
       * Function for create group column, group column created when found a first column in group,
       * @param header
       * @param groupData
       * @param groupItemId
       */
      function createGroup(header, groupData, groupItemId) {
        var groupEl = query(header).find('.' + groupData.name);
        var newElement = query(groupTemplate);

        newElement.html('<div class="dx-datagrid-text-content">' + groupData.title + '</div>');
        if (!groupEl[0])
          newElement.addClass(groupData.name);
        else
          newElement.addClass('datagrid-group-unused');
        newElement.attr('data-id', groupItemId);

        groupedColumnsCount[groupData.name]++;
        query(header).append(newElement);
      }

      /**
       * Function for search all grouped columns classes with group object
       * in HTMl element classes and return group if found
       * @param groups array of group objects
       * @param element element for search
       * @returns {object} group object
       */
      function checkGroup(groups, element) {
        for (var groupC = 0; groupC < groups.length; groupC++) {
          var group = groups[groupC];
          for (var columnC = 0; columnC < group.columns.length; columnC++) {
            if (element.hasClass(group.columns[columnC]))
              return group;
          }
        }
        return false;
      }
    }

    /**
     * Function saves the column widths set by the user
     * You must add  set columnAutoWidth: true, controlColumnResizing: true in grid
     * and name: 'gridName' in grid settings
     * @param grid
     */
    this.saveColumnsWidth = function (grid) {
      var cGrid = grid.component;
      var gName = cGrid.option('name');

      var contentReadyAction = cGrid.option('onContentReady');
      var columnsChangingAction = cGrid.option('onColumnsChanging');

      cGrid.option('onContentReady', function (e) {

        contentReadyAction && contentReadyAction(e);

        $localStorage.columnsWidth || ($localStorage.columnsWidth = {});
        $localStorage.columnsWidth[gName] || ($localStorage.columnsWidth[gName] = {});

        var visibleColumns = e.component.getController("columns").getVisibleColumns();
        e.component._columnWidths = {};
        visibleColumns.forEach(function (column) {
          var userColumnWidth = $localStorage.columnsWidth[gName][column.dataField];

          if (userColumnWidth) {
            cGrid.columnOption(column.index, 'visibleWidth', userColumnWidth);
          }
          e.component._columnWidths[column.dataField] = column.width || column.visibleWidth;
        });
      });

      cGrid.option('onColumnsChanging', function (e) {

        columnsChangingAction && columnsChangingAction(e);

        var component = e.component,
          oldColumnWidths = component._columnWidths,
          visibleColumns;

        if (component.option("controlColumnResizing") && component.option("columnAutoWidth") && e.optionNames.width) {
          visibleColumns = component.getController("columns").getVisibleColumns();
          visibleColumns.forEach(function (column) {
            if (column.width > 0 && column.width !== oldColumnWidths[column.dataField]) {
              $localStorage.columnsWidth[gName][column.dataField] = column.width;
            }
          });
        }
      })
    }

  }
})();
