angular.module('gameApp').controller('mainCtrl', ['$scope', '$timeout', 'socketFactory', 'mainFactory', 'ngDialog', 'ngNotify', '$interval', '$translate', '$cookies', function($scope, $timeout, socketFactory, mainFactory, ngDialog, ngNotify, $interval, $translate, $cookies){

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
	$scope.datas =  mainFactory;
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
		gameNumber:'0',
		jackpot:'0',
		players:{
		},
		winner : {
			name : '???',
			chance : '???',
			money : 0
		},
		gameStatus: -1,
	};

	$scope.delta = 50000; // hardcode - server wrong time problem
	$scope.currentGame = {};
	$scope.gameEndClass = '';
	$scope.gameInfoClass = false;
	$scope.timer = 0;

	$scope.updateTimer = function() {
		if ($scope.currentGame.status == 'INPROGRESS' ) {
			$scope.timer = Math.floor((Date.parse($scope.currentGame.willEnd) - Date.now() + $scope.delta)/1000);
			if ($scope.timer < 0) {
				$scope.timer = 0;
			}
		}

		if ($scope.currentGame.status == 'WAIT' ) {
			$scope.timer = Math.floor((Date.parse($scope.currentGame.waitUntil) - Date.now() + $scope.delta)/1000);
			if ($scope.timer < 0) {
				$scope.timer = 0;
			}
		}

		if ($scope.currentGame.status == 'FINISHED' ) {
			$scope.timer = 0;
		}
	};

	$scope.room = 'cs';
	$scope.switchRoom = function(room) {
		$scope.room = room;
	}

	$scope.bidsPlayers_cs = [];
	$scope.itemsTape_cs =[];
	// $scope.currency = 'руб.';
	$scope.playersTape = [];

	$scope.sound = angular.isUndefined($cookies.soundOff);
	$scope.toggleSound = function(newSound) {
		$scope.sound = newSound;

		if (newSound === false) {
			$cookies.soundOff = 1;

		} else {
			delete $cookies.soundOff;
		}
	}

	// get auth data from php-backend
	$scope.auth = window.authInit;

	$scope.num2str = function(n, textForms) {
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
	$scope.getUserImg = function(steamid) {
		if ($scope.currentGame.tradeoffers.length == 0) {
			return false;
		}
		var avatar = '';
		angular.forEach($scope.currentGame.tradeoffers ,function(value, key) {
			if (value.steamid_other == steamid) {
				avatar = value.user.avatarfull;
				return;
			}
		});

		return avatar;
	}
	
	// go-go
	$scope.socket_cs.once('connect', function () {
		var startDelta = new Date().getTime();
		$scope.socket_cs.emit('getDelta', {clientTime : new Date().getTime()});

		$scope.socket_cs.on('delta', function(delta) {
			var endDelta = new Date().getTime();
			$scope.delta = Math.abs(delta) - endDelta + startDelta;
			console.log($scope.delta);
		});
		// if move this shit into the auth...
		$scope.socket_cs.on('online', function(online){
			$scope.datas.userOnline = online;
			$scope.$digest();
		});

		// decline notification
		$scope.socket_cs.on('decline', function (data) {
			// try to translate
			$translate(data.message).then(function (message) {
				ngNotify.set( message, 'error');

			// if no translation found
			}, function (err) {
				ngNotify.set( data.message, 'error');
			});
		});

		// get user steamId
		$scope.socket_cs.emit('auth', $scope.auth);
		$scope.socket_cs.once('auth', function(authData){
			$scope.auth = authData;
			$scope.$digest();

			$scope.socket_cs.emit('current-game');
			$scope.socket_cs.on('current-game', function(data) {
				$scope.currentGame = data;

				// winner data
				$scope.loggedUser = false;

				// function display enter game
    			console.log('TRADEOFFERS-CURGAME', $scope.currentGame.tradeoffers);
    			angular.forEach($scope.currentGame.tradeoffers ,function(value, key) {
					if ($scope.auth.steamid == value.steamid_other) {
						$scope.loggedUser = true;
					} 
				});

				if (data.status == 'NEW' ) {
					$scope.winnerName = '???';
					$scope.winnerChance = '???';
					$scope.winnerJackpot = '0.00';
				}


				if (data.status == 'INPROGRESS' ) {
					$scope.timer = Math.floor((Date.parse(data.willEnd) - Date.now() + $scope.delta)/1000);
					if ($scope.timer < 0) {
						$scope.timer = 0;
					}
				}

				if (data.status == 'WAIT' ) {
					$scope.timer = Math.floor((Date.parse(data.waitUntil) - Date.now() + $scope.delta)/1000);
					if ($scope.timer < 0) {
						$scope.timer = 0;
					}
				}

				if (data.status == 'FINISHED' ) {
						$scope.timer = 0;
						$scope.winnerName = data.winner.user.personaname;
						$scope.winnerChance = (data.winner.chance*100).toFixed(2) + '%';
						$scope.winnerJackpot = data.jackpot;
				}

				

				function getAvatar(value) {
					return value.steamid_other == this.steamid;
				}


				if (data.status == 'ROULETTE' ) {
					$scope.nowDate = new Date();
					$scope.timeOfRoulette = (Date.parse($scope.currentGame.roulette) - $scope.nowDate + $scope.delta)/1000;
					$scope.players = [];
					$scope.winner = data.winner;

					angular.forEach($scope.currentGame.users, function(user, id) {
						var player = {};
						player.chance = user.chance*100;
						var tmp = $scope.currentGame.tradeoffers.filter(getAvatar, user);

						if (typeof tmp != 'undefined' && typeof tmp[0] != 'undefined') {
							player.url = tmp[0].user.avatarmedium;
						}

						$scope.players.push(player);
					});

					console.log($scope.players);
					// START. Code for playing roulette sound
			        var timer,
			        	delay = 50,
			        	audioTikSound1 = document.getElementById('tik-sound1');

			        var callSound = function() {
			            timer = $timeout(function () {
			                audioTikSound1.play();
			                delay += 25;
			                timer = $timeout(callSound, delay);
			            }, delay);
			        };

			        callSound();

			    	$timeout(function () {
						$timeout.cancel(timer);
					}, $scope.timeOfRoulette * 1000);
					// END. Code for playing roulette sound
				}

				// $scope.timeOfRoulette = 5;	// sec 

				// $scope.players = [
				// 	{
				// 		url: '/img/roulette-img.jpg',
				// 		chance: 90
				// 	},
				// 	{
				// 		url: '/img/roulette-img.jpg',
				// 		chance: 10
				// 	}
				// ];
				// END. Data for roulette
			
				$scope.$apply();
			});

			$scope.socket_cs.on('current-game-updated', function(data) {
				$scope.currentGame = data;
				$scope.loggedUser = false;

				console.log('CURRENT-GAME-UPDATED', data);
    			console.log('TRADEOFFERS-CURGAME-UPDATED', $scope.currentGame.tradeoffers);

				// function display enter game
    			angular.forEach($scope.currentGame.tradeoffers ,function(value, key) {
					if ($scope.auth.steamid == value.steamid_other) {
						$scope.loggedUser = true;
					} 
				});

				if (data.status == 'NEW' ) {
					$scope.winnerName = '???';
					$scope.winnerChance = '???';
					$scope.winnerJackpot = '0.00';
				}


				if (data.status == 'INPROGRESS' )  {
					$scope.timer = Math.floor((Date.parse(data.willEnd) - Date.now() + $scope.delta)/1000);
					$scope.$broadcast('timer-start');
					if ($scope.timer < 0) {
						$scope.timer = 0;
					}
				}
				
				if (data.status == 'WAIT' ) {
					$scope.timer = Math.floor((Date.parse(data.waitUntil) - Date.now() + $scope.delta)/1000);
					$scope.$broadcast('timer-start');
					if ($scope.timer < 0) {
						$scope.timer = 0;
					}
				}

				if (data.status == 'FINISHED' ) {
						$scope.timer = 0;
						$scope.winnerName = data.winner.user.personaname;
						$scope.winnerChance = (data.winner.chance*100).toFixed(2) + '%';
						$scope.winnerJackpot = data.jackpot;
				}

				// angular.forEach($scope.currentGame , function(value, key) {
				// 	$scope.players.push({url: $scope.currentGame.tradeoffers[key].user.avatarmedium, chance: 100}); 
				// });
				// console.log($scope.players);


				function getAvatar(value) {
					return value.steamid_other == this.steamid;
				}

				if (data.status == 'ROULETTE' ) {
					$scope.nowDate = new Date();
					$scope.timeOfRoulette = (Date.parse($scope.currentGame.roulette) - $scope.nowDate + $scope.delta)/1000;
					$scope.players = [];
					$scope.winner = data.winner;

					console.log('$scope.winner=', $scope.winner);
					console.log($scope.timeOfRoulette);

					angular.forEach($scope.currentGame.users, function(user, id) {
						var player = {};
						player.chance = user.chance*100;
						var tmp = $scope.currentGame.tradeoffers.filter(getAvatar, user);

						if (typeof tmp != 'undefined' && typeof tmp[0] != 'undefined') {
							player.url = tmp[0].user.avatarmedium;
						}

						$scope.players.push(player);
					});

					console.log($scope.players);

					// START. Code for playing roulette sound
			        var timer,
			        	delay = 50,
			        	audioTikSound1 = document.getElementById('tik-sound1');

			        var callSound = function() {
			            timer = $timeout(function () {
			                audioTikSound1.play();
			                delay += 25;
			                timer = $timeout(callSound, delay);
			            }, delay);
			        };

			        callSound();

			    	$timeout(function () {
						$timeout.cancel(timer);
					}, $scope.timeOfRoulette * 1000);
					// END. Code for playing roulette sound
				}

				$scope.$apply();
			});

			// get data
			$scope.socket_cs.emit('0');
			$scope.socket_cs.emit('2');

			$scope.socket_cs.on('inf11', function(data){console.log(data);});

			$scope.saveTradeLink = function() {
				var pattern = /https?:\/\/steamcommunity\.com\/tradeoffer\/new\/\?partner=(\d[^&]+)&token=(\w+)/g;
				if (!pattern.test($scope.auth.tradelink)) {
					ngNotify.set('Ошибка! Введите нормальную ссылку и попробуйте ещё раз.', 'error');
				} else {
					$scope.socket_cs.emit('save-tradelink', { tradelink : $scope.auth.tradelink });
					ngNotify.set('Ссылка успешно сохранена! Не забудьте открыть инвентарь чтобы получить выигрыш.', 'success');
				}
			};

			// currency
			// $scope.socket_cs.on('currency', function(data){
			// 	$scope.currency = (data == 'rur') ? 'руб.' : '$';
			// 	$scope.$digest();
			// });

			// informers
			$scope.socket_cs.on('informers', function(data){
				if(data.inf2){
					$scope.datas.allMoney = data.inf2;
				}

				else if(data.inf3){ 
					$scope.datas.uniqueUser= data.inf3;
				}

				else if(data.inf4){
					var jackpotThousands = parseFloat(data.inf4) / 1000;

					$scope.datas.maxPrize = data.inf4.toFixed();
					$scope.datas.jackpotThousands = jackpotThousands.toFixed();
				}

				else if(data.inf5) {
					if (data.inf5 !== '0') { 
						$scope.socket_cs.minDeposite = data.inf5;
					}
				}

				else if(data.inf6) {
					$scope.socket_cs.maxItems = data.inf6;
				}

				else if(data.inf7){
					$scope.datas.nmbrGames = data.inf7
				}

				else if(data.inf8){
					$scope.datas.nmbrThings = data.inf8;
					
				} else if (data.inf11) {
					$scope.datas.todayWinSumm = data.inf11;
					
				} else if (data.inf11) {
					$scope.datas.todayWinSumm = data.inf11;
				}

				$scope.$digest();
			});

			// last-winner
			$scope.socket_cs.on('last-winner', function(data){
				$scope.datas.lastWinner = data;
				$scope.$digest();
			});

			// history
			// $scope.socket_cs.on('history', function(data){
			// 	console.log(data);
			// 	// $scope.datas.history = data.history;
			// 	// $scope.$digest();
			// });

			// timer
			$scope.socket_cs.on('timer', function(data){
				var minute = data.timer.substring(0, data.timer.indexOf(':'));
				var second = data.timer.substring(data.timer.indexOf(':')+1);
				if (parseInt(minute) < 0) {
					minute = 30-parseInt(minute);
				}
				if (minute.length == 1) minute = '0'+minute;
				if (second.length == 1) second = '0'+second;
				
				$scope.datas.timer_cs['minute'] = minute;
				$scope.datas.timer_cs['second'] = second; 

				if (data.timer == '0:0') {
					$scope.game_cs.gameStatus = 0;
					$scope.gameEndClass = 'active';
				}
				
				$scope.$digest();
			});

			// push new item
			$scope.socket_cs.on('0', function(data){
				$scope.game_cs.gameStatus = 1;
				$scope.game_cs['jackpot'] = data.jackpot;

				var date = new Date();

				var offerId = data.offerid;
				var filteredPlayers = $scope.bidsPlayers_cs.filter(function(player) {
					return player.offerid === offerId;
				});

				if (filteredPlayers.length) {
					// if we already have the offer in the list
					var player = filteredPlayers[0];

					player.chance = Math.round(parseFloat(data.money)/parseFloat(data.jackpot)*10000)/100;

					player.itemcounter = data.itemcounter;
					player.jackpot = data.jacpot;
					player.money = Math.round(parseFloat(player.money + data.cost)*100)/100;
					player.updttime = date.getTime();
					player.offerid = data.offerid;
					player.items.push({
						count:data.itemcounter,
						cost:data.cost,
						itemname:data.itemname,
						image:data.image,
						color: data.color,
						background_color: data.background_color,
						border_color: data.background_color
					});

					player.lTicket = data.lTicket;

				} else {
					// create and push in $scope.bidsPlayers_cs
					var player = {};

					player.id = data.steamid;
					player.ava = data.ava;
					player.user = data.user;
					player.chance = Math.round(parseFloat(data.money)/parseFloat(data.jackpot)*10000)/100;
					player.itemcounter = data.itemcounter;
					player.jackpot = data.jackpot;
					player.money = Math.round(parseFloat(data.cost)*100)/100;
					player.updttime = date.getTime();
					player.items = [];
					player.offerid = data.offerid;

					player.items.push({
						count:data.itemcounter,
						cost:data.cost,
						itemname:data.itemname,
						image:data.image,
						color: data.color,
						background_color: data.background_color,
						border_color: data.background_color
					});

					player.fTicket = data.fTicket;
					player.lTicket = data.lTicket;

					$scope.bidsPlayers_cs.push(player);	
				}

				var jackPt = parseFloat(data.jackpot);
				var newPlayer = {};
				newPlayer.chance = Math.round(parseFloat(data.money)/jackPt*10000)/100;
				newPlayer.steamid = data.steamid;
				newPlayer.money = data.money;
				newPlayer.ava = data.ava;
				newPlayer.itemsCount = 1;
				var filteredPlayersByID = $scope.playersTape.filter(function(pl) {
					return pl.steamid === data.steamid;
				});
				if (filteredPlayersByID.length) {
					filteredPlayersByID[0].chance = newPlayer.chance;
					filteredPlayersByID[0].money = newPlayer.money;
					filteredPlayersByID[0].itemsCount += newPlayer.itemsCount;
				} else {
					$scope.playersTape.push(newPlayer);
				}

				angular.forEach($scope.playersTape, function(value, key) {
					var newChance = Math.round(parseFloat($scope.playersTape[key].money)/jackPt*10000)/100;
					if ($scope.auth.hasOwnProperty('steamid') && $scope.auth.steamid == value.steamid) {
						$scope.socket_cs.currentChance = newChance;
						$scope.socket_cs.tempItemsCount = value.itemsCount;
					}

					$scope.playersTape[key].chance = newChance;
				});

				$scope.game_cs['itemsCount']++;

				// play sound
				if ($scope.sound) {
					document.getElementById('new-item-sound').play();
				}
			});

			// type 2
			$scope.socket_cs.on('2', function(data){
				$scope.game_cs['gameNumber'] = data.gamenumber;
				$scope.game_cs['jackpot'] = data.jackpot;
				$scope.game_cs['hash'] = data.roundHash;
			});

			// end-game
			$scope.socket_cs.on('end-game', function(data){
				$scope.hideBeforeGame_cs = 'hide-bl';
				$scope.hideGameEnd_cs = '';

				angular.forEach($scope.playersTape,function(value, key) {
					var	imgNmbr = Math.round(value.chance);

					for (i = 0; i < imgNmbr; i++){
						$scope.itemsTape_cs.push(value.ava);
					}
				});

				$scope.itemsTape_cs = $scope.shuffle($scope.itemsTape_cs);
				$scope.itemsTape_cs.splice(100, $scope.itemsTape_cs.length-100);
				if ($scope.itemsTape_cs.length < 100) {
					var differ = 100 - $scope.itemsTape_cs.length;
					for (var i = 0; i < differ; i++) {
						$scope.itemsTape_cs.push($scope.itemsTape_cs[0]);
					}
				}

				//$scope.itemsTape_cs[93] = data.ava;
				$scope.itemsTape_cs[94] = data.ava;
				//$scope.itemsTape_cs[95] = data.ava;

				var audioTikSound = document.getElementById('tik-sound');
				var i = 50;
				var timerId1 = setTimeout(playTikSound, i);

				function playTikSound() {
					audioTikSound.play();
					i += 25;
					timerId1 = setTimeout(playTikSound, i);
				}

				$timeout(function(){
					$scope.corouselActive_cs = 'carousel-active';
					$scope.game_cs.winner.money = data.money;

					// roulette is running
					$timeout(function(){
						$scope.game_cs.winner.name = data.name;
						$scope.game_cs.winner.chance = data.chance.toFixed(2) + '%';
						$scope.gameInfoClass = true;
						$scope.game_cs['num'] = data.roundNum;
						$scope.game_cs['winnerTicket'] = data.winnerTicket;

						clearTimeout(timerId1);  //Add 25.08.15
					}, 13000);
				}, 1000);

				$scope.$digest();
			});

			// end-game-empty
			$scope.socket_cs.on('end-game-empty', function(data){
				$scope.$digest();
			});

			// start-game
			$scope.socket_cs.on('start-game', function(data){
				$scope.game_cs.gameStatus = -1;
				$scope.gameEndClass = '';
				$scope.gameInfoClass = false;
				// sound
				if ($scope.sound) {
					document.getElementById('start-game-sound').play();
				}

				$scope.socket_cs.currentChance = 0;
				$scope.socket_cs.tempItemsCount = 0;

				// model
				$scope.game_cs['itemsCount'] = 0;
				$scope.maxItems = 100;
				$scope.game_cs['itemsCount'] = 0;
				$scope.game_cs['playerChance'] = 20;
				$scope.game_cs['players'] = {};
				$scope.game_cs.winner = {
					name : '???',
					chance : '???',
					money : 0
				}

				// DOM
				$scope.hideBeforeGame_cs = '';
				$scope.hideGameEnd_cs = 'hide-bl';

				$scope.bidsPlayers_cs = [];
				$scope.playersTape = [];
				$scope.itemsTape_cs = [];
				$scope.corouselActive_cs = '';

				$scope.$digest();
			});


		});

		$scope.socket_cs.emit('informers');

		$scope.socket_cs.on('informers', function(data) {
			console.log(data);
			$scope.informer = data.informer;
			$scope.infConfig = data.config;
			$scope.lastWinner = data.informer.lastWinner;
			$scope.currency = (data.config.currency == 'rur') ? 'руб.' : '$';
		});
	});

	$scope.shuffle = function(o){
		for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
		return o;
	}
	
	$scope.changeLanguage = function (key) {
		$translate.use(key);
		$scope.lang = key;

		$cookies.lang = key;
	};

	$scope.openFairPlayModal = function() {
		ngDialog.open({
			template: '/templates/modal-fairplay.html',
			controller : 'fairplayCtrl'
		});
	};

	// @TODO wtf???
	$scope.openFairModal = function() {
		ngDialog.open({
			template: '/templates/fair-play.html',
			controller : 'fairplayCtrl'
		});
	};

	$scope.openProfileModal = function() {
		ngDialog.open({
			template: '/templates/my-profile.html',
			controller : 'myProfileCtrl'
		});
	};

	$scope.openSupportModal = function() {
		ngDialog.open({
			template: '/templates/support.html',
			controller : 'supportCtrl'
		});
	};

	$scope.hoverIn = function(){
       this.hoverEdit = true;
    };

    $scope.hoverOut = function(){
        this.hoverEdit = false;
    };
}]);