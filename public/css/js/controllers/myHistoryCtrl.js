angular.module('gameApp').controller('myHistoryCtrl', function($scope, socketFactory, mainFactory){
	$scope.socket_cs = socketFactory.cs;

	$scope.socket_cs.emit('my-history');

	$scope.socket_cs.on('my-history', function(data) {
		$scope.socket_cs.myHistory = data;
		console.log('My history', data);
		angular.forEach($scope.socket_cs.myHistory, function(value, key) {
			var userItemsCounter = 0;
			angular.forEach(value.items, function(val, k) {
				if (val.steamid == $scope.auth.steamid) {
					userItemsCounter++;
				}
			});
			value.userItemsCounter = userItemsCounter;
		});
		$scope.$digest();
	});

	// $scope.socket_cs.emit('user-history', {steamid: auth.steamid});

	// $scope.socket_cs.once('user-history', function(data) {
	// 	console.log(data);

	// 	angular.forEach(data, function(value, key) {
	// 		value.bidSize = 0;
	// 		value.bid = [];
	// 		value.bidMoney = 0;
	// 		angular.forEach(value.allItems, function(item, id) {
	// 			if (item.steamid == auth.steamid) {
	// 				value.bidSize++;
	// 				value.bid.push(item);
	// 				value.bidMoney += item.cost;
	// 			}
	// 		});
	// 		if (auth.steamid == value.steamid) {
	// 			value.won = true;
	// 			value.yourchance = value.winnerchance;
	// 		} else {
	// 			value.won = false;
	// 			value.yourchance = value.bidMoney / value.winnermoney * 100;
	// 		}
	// 	});

	// 	$scope.userHistory = data;
	// 	$scope.$digest();
	// });

	$scope.hoverIn = function(){
       this.hoverEdit = true;
    };

    $scope.hoverOut = function(){
        this.hoverEdit = false;
    };
});