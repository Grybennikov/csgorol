(function() {
  'use strict';

  angular
    .module('admin')
    .service('ErrorMessages', ErrorMessages);

  function ErrorMessages ($log, $window, $translate) {

    var _ErrorMessages = this;
    var LC = function (locale) {
      return $translate.instant('COMMON.ERRORS.' + locale);
    };

    _ErrorMessages.process = function(err) {
      $log.error(err);
      switch (err.status) {
        case 400: $window.DevExpress.ui.notify(err.data.message, "error", 1000); break;
        case 422: $window.DevExpress.ui.notify(err.data.map(function(error) {
          return error.message;
        }), "error", 1000); break;
        case 404:
        case 500: $window.DevExpress.ui.notify(LC('SERVER'), "error", 1000); break;
      }
    }

  }
})();
