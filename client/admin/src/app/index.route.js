(function () {
  'use strict';

  angular
    .module('admin')
    .config(routerConfig);

  /** @ngInject */
  function routerConfig($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('siteSettings', {
        url: '/',
        templateUrl: 'app/siteSettings/siteSettings.html',
        controller: 'SiteSettingsController',
        controllerAs: 'siteSettings',
        resolve: {
          settings: function(SiteSettings) {
            return SiteSettings.list(true);
          },
          jackpotGame: function(JackpotGames) {
            return JackpotGames.list(true);
          },
        }
      })
      .state('users', {
        url: '/users',
        templateUrl: 'app/users/users.html',
        controller: 'UsersController',
        controllerAs: 'users'
      })
      .state('items', {
        url: '/items',
        templateUrl: 'app/items/items.html',
        controller: 'ItemsController',
        controllerAs: 'items'
      })
      .state('jackpotGames', {
        url: '/jackpotGames',
        templateUrl: 'app/jackpotGames/jackpotGames.html',
        controller: 'JackpotGamesController',
        controllerAs: 'jackpotGames'
      })
      .state('jackpotBets', {
        url: '/jackpotBets',
        templateUrl: 'app/jackpotBets/jackpotBets.html',
        controller: 'JackpotBetsController',
        controllerAs: 'jackpotBets'
      })
    $urlRouterProvider.otherwise('/');
  }

})();
