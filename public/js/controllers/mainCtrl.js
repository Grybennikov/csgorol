angular.module('gameApp').controller('mainCtrl', [
  '$scope', '$http', '$timeout', 'socketFactory', 'mainFactory', 'ngDialog', 'ngNotify', '$interval', '$translate', '$cookies', 'Warehouse',
  function ($scope, $http, $timeout, socketFactory, mainFactory, ngDialog, ngNotify, $interval, $translate, $cookies, Warehouse) {

    // ngNotify defaults
    ngNotify.config({
      theme: 'pure',
      position: 'top',
      duration: 4000,
      type: 'info',
      sticky: false,
      html: true
    });

    // Cookies for lang
    if ($cookies.lang) {
      $scope.lang = $cookies.lang;
      $translate.use($cookies.lang);
    } else {
      $scope.lang = 'ru';
    }
    $scope.socket_cs = socketFactory.cs;
    $scope.socket_cs.currentChance = 0;
    $scope.socket_cs.tempItemsCount = 0;
    $scope.socket_cs.minDeposite = 0;
    $scope.socket_cs.maxItems = 0;
    $scope.datas = mainFactory;
    $scope.corouselActive_cs = '';
    $scope.hideBeforeGame_cs = '';
    $scope.hideGameEnd_cs = 'hide-bl';
    $scope.winnerName = '???';
    $scope.winnerChance = '???';
    $scope.winnerJackpot = '0.00';
    $scope.date = new Date();
    $scope.elemNmbr = 0;
    $scope.maxItems = 100;
    $scope.timeToBigDota = 0;
    $scope.timeToBigCS = 0;
    $scope.game_cs = {
      itemsCount: 0,
      playerChance: '20',
      gameNumber: '0',
      jackpot: '0',
      players: {},
      winner: {
        name: '???',
        chance: '???',
        money: 0
      },
      gameStatus: -1,
    };

    $scope.delta = 50000; // hardcode - server wrong time problem
    $scope.currentGame = {};
    $scope.gameEndClass = '';
    $scope.gameInfoClass = false;
    $scope.timer = 0;

    $scope.updateTimer = function () {
      if ($scope.currentGame.status == 'INPROGRESS') {
        $scope.timer = Math.floor((Date.parse($scope.currentGame.willEnd) - Date.now() + $scope.delta) / 1000);
        if ($scope.timer < 0) {
          $scope.timer = 0;
        }
      }

      if ($scope.currentGame.status == 'WAIT') {
        $scope.timer = Math.floor((Date.parse($scope.currentGame.waitUntil) - Date.now() + $scope.delta) / 1000);
        if ($scope.timer < 0) {
          $scope.timer = 0;
        }
      }

      if ($scope.currentGame.status == 'FINISHED') {
        $scope.timer = 0;
      }
    };

    $scope.room = 'cs';
    $scope.switchRoom = function (room) {
      $scope.room = room;
    }

    $scope.bidsPlayers_cs = [];
    $scope.itemsTape_cs = [];
    $scope.currency = '$';
    $scope.playersTape = [];

    $scope.sound = angular.isUndefined($cookies.soundOff);
    $scope.toggleSound = function (newSound) {
      $scope.sound = newSound;

      if (newSound === false) {
        $cookies.soundOff = 1;

      } else {
        delete $cookies.soundOff;
      }
    }

    // get auth data from php-backend
    $scope.auth = window.authInit;

    $scope.num2str = function (n, textForms) {
      n = Math.abs(n) % 100;
      var n1 = n % 10;

      if (n > 10 && n < 20) {
        return textForms[2];
      }

      if (n1 > 1 && n1 < 5) {
        return textForms[1];
      }

      if (n1 == 1) {
        return textForms[0];
      }

      return textForms[2];
    }

    // hardcode, better idea to get from backend
    $scope.getUserImg = function (steamid) {
      if ($scope.currentGame.tradeoffers.length == 0) {
        return false;
      }
      var avatar = '';
      angular.forEach($scope.currentGame.tradeoffers, function (value, key) {
        if (value.steamid_other == steamid) {
          avatar = value.user.avatarfull;
          return;
        }
      });

      return avatar;
    }


    $scope.shuffle = function (o) {
      for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
      return o;
    }

    $scope.changeLanguage = function (key) {
      $translate.use(key);
      $scope.lang = key;

      $cookies.lang = key;
    };

    $scope.openFairPlayModal = function () {
      ngDialog.open({
        template: '/templates/modal-fairplay.html',
        controller: 'fairplayCtrl'
      });
    };

    // @TODO wtf???
    $scope.openFairModal = function () {
      ngDialog.open({
        template: '/templates/fair-play.html',
        controller: 'fairplayCtrl'
      });
    };

    $scope.openProfileModal = function () {
      ngDialog.open({
        template: '/templates/my-profile.html',
        controller: 'myProfileCtrl'
      });
    };

    $scope.openSupportModal = function () {
      ngDialog.open({
        template: '/templates/support.html',
        controller: 'supportCtrl'
      });
    };

    $scope.hoverIn = function () {
      this.hoverEdit = true;
    };

    $scope.hoverOut = function () {
      this.hoverEdit = false;
    };


    $scope.saveTradeLink = function () {
      var pattern = /https?:\/\/steamcommunity\.com\/tradeoffer\/new\/\?partner=(\d[^&]+)&token=(\w+)/g;
      if (!pattern.test($scope.auth.tradelink)) {
        ngNotify.set('Ошибка! Введите нормальную ссылку и попробуйте ещё раз.', 'error');
      } else {
        $http.put('/api/user/' + $scope.auth.steamid, {tlink: $scope.auth.tradelink})
          .then(function () {
            ngNotify.set('Ссылка успешно сохранена! Не забудьте открыть инвентарь чтобы получить выигрыш.', 'success');
          })
      }
    };

    /** NEW qwe **/
    var socket = io();
    $scope.showRoulette = false;
    $scope.newBet = false;
    $scope.userItems = [];
    $scope.UI = {
      showInventory: false,
      itemsLoading: false
    }
    $scope.maxJackpotInGame = 0;

    //INVENTORY

    $scope.selectItem = function (id, index) {
      if ($scope.inventoryItems[index].id == id) {
        $scope.inventoryItems[index].selected = !$scope.inventoryItems[index].selected;
      }
    }

    $scope.newBetTrigger = function () {
      if ($scope.UI.showInventory) {
        $scope.UI.showInventory = false;
      } else {
        $scope.userItems = [];
        $scope.newBet = [];
        $scope.UI.showInventory = true;
        $scope.UI.itemsLoading = true;

        Warehouse.list()
          .then(function (items) {
            $scope.UI.itemsLoading = false;
            $scope.inventoryItems = items;
          })
      }
    }

    $scope.reloadInventory = function () {
      $scope.loading = true;
      $scope.inventorySumm = 0;

      Warehouse.list()
        .then(function (items) {
          $scope.loading = false;
          $scope.inventoryItems = items;
          items.forEach(function(e){
            $scope.inventorySumm += e.price;
          })
        });
    }

    $scope.putBet = function () {
      let items = $scope.inventoryItems.filter(function(item) {
        return item.selected
      });

      if (!items.length) {
        return ngNotify.set('Select the skins!!!', {
          type: 'error',
          duration: 2000
        })
      }
      $scope.loading = true;

      items = items.map(function(e){
        return e.id;
      });

      $http.post('/api/jackpotBets', {betItems: items})
        .then(function(res){
          $scope.loading = false;
          $scope.reloadInventory();
        })
        .catch(function(err){
          ngNotify.set(err.data.msg  || 'Server Error', {
            type: 'error',
            duration: 2000
          })
        })
    }


    //INVENTORY

    $scope.betsGrouped = [];
    loadFirstData();
    function loadFirstData() {

      $http.get('/api/jackpotGames/', {
          params: {
            current: true
          }
        })
        .then(function (data) {
          $scope.stats = data.data.stats;
          $scope.datas.userOnline = data.data.usersOnline;
          $scope.infConfig = data.data.settings;
          $scope.currentGame = data.data.gameData;
          $scope.prevGame = data.data.prevGame;
        })

      $http.get('/api/jackpotBets/', {
          params: {
            current: true
          }
        })
        .then(function (data) {
          data = data.data;
          $scope.bets = data;
          var usersWithBets = _.groupBy(data, 'userId');

          _.mapKeys(usersWithBets, function (e) {

            $scope.betsGrouped.unshift({
              userId: e[0].userId,
              avatar: e[0].User.avatar,
              name: e[0].User.name,
              sum: _.sumBy(e, 'Warehouse.price'),
              items: e
            });
          });
          if ($scope.bets.length) {
            $scope.maxJackpotInGame = _.maxBy($scope.bets, 'Warehouse.price')
            $scope.maxJackpotInGame = $scope.maxJackpotInGame.Warehouse.price;
          }
        })
    }

    $scope.getUserChance = function (userId) {
      var userCost = 0;
      $scope.bets.forEach(function (e) {
        if (e.userId == userId) {
          userCost += e.Warehouse.price;
        }
      });

      var userChance = userCost * 100 / $scope.currentGame.cost;
      userChance = userChance.toFixed(2);
      return userChance;
    }

    socket.on('newJackpotBet', function (data) {
      $scope.bets = _.concat(data.bets, $scope.bets);
      $scope.currentGame = data.gameData;
      $scope.betsGrouped.unshift({
        userId: data.bets[0].userId,
        avatar: data.bets[0].User.avatar,
        name: data.bets[0].User.name,
        sum: _.sumBy(data.bets, 'Warehouse.price'),
        items: data.bets
      });
      if ($scope.bets.length) {
        $scope.maxJackpotInGame = _.maxBy($scope.bets, 'Warehouse.price')
        $scope.maxJackpotInGame = $scope.maxJackpotInGame.Warehouse.price;
      }
      $scope.$apply();
    });

    socket.on('timeToGame', function (data) {
      $scope.timer = data.gameTime;
      $scope.$apply();
    });

    socket.on('usersOnline', function (data) {
      $scope.$apply(function () {
        $scope.datas.userOnline = data.count;
      });
    });

    socket.on('jackpotWinner', function (data) {
      winnerID = data.winnerId;

      $scope.showRoulette = true;

      $scope.renderRoulette(data.winnerId);
      $scope.newGameTimer = 15;

      var qwe = setInterval(function () {
        $scope.$apply(function () {
          if ($scope.newGameTimer <= 0) {
            clearInterval(qwe);
            winMsg = false;
            $scope.showRoulette = false;
            $scope.timer = 0;
            winnerID = false;
            $scope.bets = [];
            $scope.betsGrouped = [];
            $scope.itemsList = [];
            var roulElement = angular.element(document.getElementsByClassName('qwe'));
            roulElement.css('background-image', 'url()')
            roulElement.removeClass('roulette-template');


            //Обновление данных
            $scope.stats.gamesTotalCost  +=  $scope.currentGame.cost;
            $scope.stats.gamesCount++;
            $scope.currentGame.id++;
            $scope.currentGame.itemsnum = 0;
            $scope.currentGame.cost = 0;
            $scope.maxJackpotInGame = 0;

            return false;
          } else {
            $scope.newGameTimer -= 1;
          }
        })
      }, 1000);
    });

    socket.on('jackpotGamePrevData', function (data) {
      $scope.$apply(function(){
        $scope.prevGame = data.data;
      })
    })

    var imageSize = 75;
    $scope.renderRoulette = function (winnerId) {

      getPlayersData(winnerId);

      var canvas = document.createElement('canvas');

      var context = canvas.getContext("2d");

      var img = new Image();

      var x = 0;

      canvas.width = $scope.rouletteGamers.length * imageSize;
      canvas.height = imageSize;

      $scope.rouletteGamers.forEach(function (e, index) {

        img.src = e.avatar;
        img.width = imageSize;
        img.height = imageSize;

        //context.fillStyle = "#fff";
        context.drawImage(img, x, 0, 75, 75);
        //context.fillText(index, x, 10);

        x += imageSize;
      });
      var roulElement = angular.element(document.getElementsByClassName('qwe'));
      roulElement.css('background-image', 'url(' + canvas.toDataURL() + ')')
      roulElement.addClass('roulette-template');
      setTimeout(function () {
        var index = _.findIndex($scope.bets, ['userId', winnerId]);
        $scope.winnerChance = $scope.getUserChance(winnerId);
        $scope.winnerName = $scope.bets[index].User.name;
      }, 10000);

    }

    var winMsg = false;

    var players = [];

    function getPlayersData(winnerId) {
      var minChance = 100;
      var chance = 0;
      var usersWithBets = _.groupBy($scope.bets, 'userId');

      $scope.rouletteGamers = [];

      var playersExist = false;

      while (players.length < 100) {
        for (var userId in usersWithBets) {

          var avatar = usersWithBets[userId][0].User.avatar;
          var chance = $scope.getUserChance(userId);
          var avatarCount = parseInt(chance);

          if (avatarCount < 0) {
            avatarCount = 1;
          }
          avatarCount += 4;

          for (var i = 0; i < avatarCount; i++) {
            playersExist = true;

            players.splice(parseInt(Math.random() * players.length), 0, {
              userId: userId,
              avatar: avatar,
              chance: chance
            });
          }

        }

        if (!playersExist) {
          console.log('Игроков нет')
          return;
        }
      }

      var index = _.findIndex($scope.bets, ['userId', winnerId]);
      players.splice(81, 0, {
        userId: winnerId,
        avatar: $scope.bets[index].User.avatar,
        chance: $scope.getUserChance(winnerId)
      });

      $scope.rouletteGamers = players;
    }


  }]);
