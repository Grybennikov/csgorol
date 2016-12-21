(function() {
  'use strict';

  angular
    .module('admin')
    .service('SiteSettings', SiteSettings);

  /** @ngInject */
  function SiteSettings($log, $http, $window, $translate, ErrorMessages) {

    var _SiteSettings = this;
    var LC = $translate.instant;

    /**
     * DataStore for accessing to user list
     * @type {DevExpress.data.CustomStore}
     */
    var siteSettingsStore = new $window.DevExpress.data.CustomStore({
      totalCount: function () {
        return 0;
      },
      load: function() {
        return listSiteSettings();
      },
      update: function(oldData, newData) {
        return editSiteSettings(oldData, newData)
      },
      remove: function (data) {
        return removeSiteSettings(data.id);
      }
    });

    /**
     * Function makes request to back-end for user list
     * @returns {*}
     */
    function listSiteSettings(toObject) {
      return $http.get('/api/siteSettings', {
        params: {
          toObject: toObject
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

    /**
     * Function makes request to back-end for update user
     * @param siteSettingsData
     * @param updatedSiteSettingsData
     * @returns {*}
     */
    function editSiteSettings (name, value) {
      return $http.put('/api/siteSettings/' + encodeURIComponent(name), {value: value})
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
    function addSiteSettings(siteSettingsData) {
      return $http.post('/api/siteSettings', siteSettingsData)
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
     * @param id
     * @returns {*}
     */
    function removeSiteSettings(id) {
      return $http.delete('/api/siteSettings/' + encodeURI(id))
        .then(function (res) {
          return res.data;
        })
        .catch(function (err) {
          ErrorMessages.process(err);
        });
    }

    function refresh2fCode (botName) {
      return $http.get('/api/2fa/code/' + encodeURIComponent(botName))
        .then(function (res) {
          $window.DevExpress.ui.notify(LC('COMMON.SUCCESS.UPDATE'), "success", 1000);
          return res.data;
        });
    }

    function withdraw(link) {
      return $http.post('/api/warehouse/withdraw/admin', {link: link})
        .then(function (res) {
          return res.data;
        })
        .catch(function (err) {
          ErrorMessages.process(err);
        });
    }

    _SiteSettings.siteSettingsStore = siteSettingsStore;
    _SiteSettings.list = listSiteSettings;
    _SiteSettings.add = addSiteSettings;
    _SiteSettings.edit = editSiteSettings;
    _SiteSettings.remove = removeSiteSettings;

    _SiteSettings.refresh2fCode = refresh2fCode;

    _SiteSettings.withdraw = withdraw;
  }
})();
