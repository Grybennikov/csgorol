angular.module('gameApp').controller('gameCtrl', ['$scope', '$http', '$routeParams', 'socketFactory', 'mainFactory', '$location',
  function($scope, $http, $routeParams, socketFactory, mainFactory, $location){
	$scope.socket_cs = socketFactory.cs;
	$scope.datas =  mainFactory;

	var gameId = parseInt($routeParams.gameId, 10);

  $http.get('/api/jackpotGames/' + encodeURI(gameId))
    .then(function(data) {
      data = data.data;
      console.log(data);
      $scope.singleGame = data;
      $scope.winTicket = parseInt(parseFloat(data.module)  * data.cost * 100);
      $scope.sumTickets = data.cost * 100;
    })



	// console.log(gameId);
	// if (isNaN(gameId)) {
	// 	$location.path('/');
	// 	return;
	// }

	// $scope.socket_cs.emit('getGame', { gameId : gameId });
	// $scope.socket_cs.once('gameInfo', function(data){

	// 	var gameInfo = {
	// 		game : data.result.game,
	// 		bank : data.result.bank,
	// 		winnername : data.result.winnername,
	// 		winnerchance : data.result.winnerchance,
	// 		winnermoney : data.result.winnermoney,
	// 		roundNum : data.result.roundNum,
	// 		roundHash : data.result.roundHash,
	// 		winnerTicket : data.result.winnerTicket,
	// 		bids : {}
	// 	};

	// 	angular.forEach(data.result.items, function(item, k){
	// 		if (typeof gameInfo.bids[item.offerid] == "undefined") {
	// 			gameInfo.bids[item.offerid] = {
	// 				user: item.user,
	// 				ava: item.ava,
	// 				steamid : item.steamid,
	// 				fTicket: item.fTicket,
	// 				lTicket: item.lTicket,
	// 				money : Math.round(parseFloat(item.cost)*100)/100,
	// 				chance: Math.round(parseFloat(item.money)/parseFloat(item.jackpot)*10000)/100,
	// 				items : []
	// 			};

	// 			gameInfo.bids[item.offerid].items.push({
	// 				color: item.color,
	// 				background_color: item.background_color,
	// 				image: item.image,
	// 				cost: item.cost
	// 			});

	// 		} else {
	// 			gameInfo.bids[item.offerid].lTicket = item.lTicket;
	// 			gameInfo.bids[item.offerid].money = Math.round(parseFloat(gameInfo.bids[item.offerid].money + item.cost)*100)/100;
	// 			gameInfo.bids[item.offerid].itemcounter = item.itemcounter;
	// 			gameInfo.bids[item.offerid].chance = Math.round(parseFloat(item.money)/parseFloat(item.jackpot)*10000)/100;

	// 			gameInfo.bids[item.offerid].items.push({
	// 				color: item.color,
	// 				background_color: item.background_color,
	// 				image: item.image,
	// 				cost: item.cost
	// 			});
	// 		}
	// 	});

	// 	$scope.gameInfo = gameInfo;

	// 	$scope.hideGameEnd_cs = false;
	// 	$scope.gameEndClass = 'active';

	// 	$scope.$digest();
	// })
}]);
