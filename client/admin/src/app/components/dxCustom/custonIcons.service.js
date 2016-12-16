(function() {
  'use strict';

  angular
    .module('dxCustom')
    .service('customIcons', customIcons);

  /** @ngInject */
  function customIcons($window) {
    this.editRow = function () {
      this.className += ' glyphicon glyphicon-pencil';
      this.style.textDecoration = 'none';
      return '';
    };

    this.deleteRow = function () {
      this.className += ' glyphicon glyphicon-trash';
      this.style.textDecoration = 'none';
      return '';
    };

    this.saveRowChanges = function () {
      this.className += ' glyphicon glyphicon-ok';
      this.style.textDecoration = 'none';
      return '';
    };

    this.cancelRowChanges = function () {
      this.className += ' glyphicon glyphicon-remove';
      this.style.textDecoration = 'none';
      return '';
    };

    this.customAction = function (data, action, elementClass) {
      if(data.rowType == "data") {
        var parent = data.rowElement.find('.dx-command-edit');
        var child = $window.$('<a class=" ' + elementClass + ' "></a>')
          .on('dxclick', action)
          .val(data.key.id)
          .attr('data', angular.toJson(data.key));
        child.addClass('dx-link');
        parent.append(child)
      }
      return '';
    };

  }
})();
