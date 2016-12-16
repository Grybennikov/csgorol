angular.module('gameApp').controller('rouletteCtrl', ['$scope', 'socketFactory', '$timeout', function ($scope, socketFactory, $timeout) {

	$scope.multipliedPlayers = [];
	
	$scope.$watch('playersAttr', function () {
		$scope.multipliedPlayers = multiplyPlayers($scope.playersAttr);
		$scope.multipliedPlayers[93] = {chance: ($scope.winnerAttr.chance*100).toFixed(2), url: $scope.winnerAttr.user.avatarfull};
		$scope.startAnimation();	
	});

	function multiplyPlayers(playersArr) {
		var 
			numberOfPlayers = playersArr.length,
			playersChances = [],
			players = [];
		for (var i = numberOfPlayers; i; i--) {
			var j = i -1;
			playersChances[j] = playersArr[j].chance ^ 0;
			for (var k = 0; k < playersChances[j]; k++) {
				players.push(playersArr[j]);
			}
		}

		var shortcoming = 100 - players.length;
		for (; shortcoming; shortcoming--) {
			players.push(playersArr[0]);
		}

		return shuffle(players);
	}

	function shuffle(o) {
		for(var j, x, k = o.length; k; j = Math.floor(Math.random() * k), x = o[--k], o[k] = o[j], o[j] = x);
		return o;
	}
}]);