(function() {
  'use strict';

  angular
    .module('admin')
    .constant('EnglishTranslations', {
      COMMON: {
        SUCCESS: {
          ADD: 'Data successfully added',
          UPDATE: 'Data successfully updated'
        },
        ERRORS: {
          ADD: 'Error in add data',
          UPDATE: 'Update fail',
          SERVER: 'Sorry. Server error'
        }
      },
      MAIN: {
        MENU_ITEMS: {
          USERS: 'Users',
          ITEMS: 'Items',
          SITE_SETTINGS: 'Site settings',
          ROULETTE_BETS: 'Roulette bets',
          JACKPOT_GAMES: 'Jackpot games',
          JACKPOT_BETS: 'Jackpot bets',
          COIN_FLIP_BETS: 'Coin flip games',
          LOTTERY_ITEMS: 'Lottery games',
          LOTTERY_BETS: 'Lottery bets'
        }
      },
      USERS: {
        TITLE: 'Users',
        GRID_TITLES: {
          ID: 'id',
          STEAM_ID: 'Steam Id',
          NAME: 'Name',
          TLINK: 'Traide link',
          ADMIN: 'Admin',
          AVATAR: 'Avatar',
          CREDITS: 'Credits',
          IP: 'ip',
          VISIT_DATE: 'Visit date',
          BAN: 'Ban'
        }
      },
      ITEMS: {
        TITLE: 'Items',
        GRID_TITLES: {
          ID: 'Id',
          NAME: 'Name',
          PRICE: 'Price'
        }
      },
      SITE_SETTINGS: {
        TITLE: 'Site settings',
        GRID_TITLES: {
          NAME: 'Name',
          VALUE: 'Value'
        }
      }
    })

})();
