(function () {
  'use strict';

  angular
    .module('admin')
    .controller('SiteSettingsController', SiteSettingsController);

  /** @ngInject */
  function SiteSettingsController($translate, $window, $state, customIcons, customDataGrid,
                                  SiteSettings, JackpotGames,
                                  settings, jackpotGame) {
    var vm = this;
    var LC = $translate.instant;
    vm.settings = {};
    var jackpotUsers = _.uniqBy(jackpotGame.gameData.JackpotBets, 'userId');

    vm.settings.percent       = parseInt(settings.rake);
    vm.settings.minBet        = parseFloat(settings.minbet);
    vm.settings.maxGameItems  = parseInt(settings.maxitems);
    vm.settings.gameTime      = parseInt(settings.gameTime);
    vm.settings.tradeLink     = settings.tradelink;

    vm.tradeLink = '';

    vm.botsCodes = {
      jackpotBot: '----',
      warehouseBot: '----'
    };

    vm.SiteSettings = SiteSettings;

    /**
     * Function will be reload state
     */
    vm.stateReload = function () {
      $state.reload();
    }

    /**
     * Function will be change site settings
     * @param e DX element
     */
    vm.change = function (e) {
      e.jQueryEvent && SiteSettings.edit(e.component.option('name'), e.value);
    };

    vm.refreshCode = function (botName) {
      SiteSettings.refresh2fCode(botName)
        .then(function(data) {
          vm.botsCodes[botName] = data.code;
        })
        .catch(function(err) {
          $window.DevExpress.ui.notify(LC('COMMON.ERRORS.SERVER'), "error", 1000);
        })
    }

    vm.UI = {
      persentRange: {
        name: 'rake',
        min: 0,
        max: 100,
        showSpinButtons: true,
        step: 1,
        onValueChanged: vm.change,
        bindingOptions: {
          value: 'siteSettings.settings.percent'
        }
      },
      minBet: {
        name: 'minbet',
        min: 0.01,
        showSpinButtons: true,
        step: 0.01,
        onValueChanged: vm.change,
        bindingOptions: {
          value: 'siteSettings.settings.minBet'
        }
      },
      maxGameItems: {
        name: 'maxitems',
        min: 2,
        showSpinButtons: true,
        step: 1,
        onValueChanged: vm.change,
        bindingOptions: {
          value: 'siteSettings.settings.maxGameItems'
        }
      },
      maxUserItems: {
        name: 'maxGameItems',
        min: 1,
        showSpinButtons: true,
        step: 1,
        onValueChanged: vm.change,
        bindingOptions: {
          value: 'siteSettings.settings.maxGameItems'
        }
      },
      gameTime: {
        name: 'gameTime',
        min: 1,
        showSpinButtons: true,
        step: 1,
        onValueChanged: vm.change,
        bindingOptions: {
          value: 'siteSettings.settings.gameTime'
        }
      },
      tradeLink: {
        name: 'tradeLink',
        onValueChanged: vm.change,
        width: '600px',
        bindingOptions: {
          value: 'siteSettings.settings.tradeLink'
        }
      },
      chooseWinnerList: {
        width: 440,
        dataSource: jackpotUsers,
        value: jackpotGame.gameData.userId,
        valueExpr: 'userId',
        displayExpr: 'userId',
        itemTemplate: 'choseWinnerTemplate',
        onSelectionChanged: function (data, value) {
          jackpotGame.gameData.userId = data.selectedItem.userId;
        }
      },
      chooseWinnerButton: {
        text: 'Choose',
        onClick: function(){
          JackpotGames.edit(jackpotGame.gameData, {userId: jackpotGame.gameData.userId})
            .then(function(){
              vm.stateReload()
            })
        }
      },
      resetWinnerButton: {
        text: 'Reset',
        onClick: function(){
          JackpotGames.edit(jackpotGame.gameData, {userId: ''})
            .then(function(){
              vm.stateReload()
            })
        }
      },
      withdrawLink: {
        width: 500,
        bindingOptions: {
          value: 'siteSettings.tradeLink'
        }
      },
      withdrawButton: {
        text: 'Withdraw',
        onClick: function(){
          SiteSettings.withdraw(vm.tradeLink)
            .then(function(){
              $window.DevExpress.ui.notify('Скины успешно отправлены', "success", 1000);
            })
        }
      }
    }

  }
})();
