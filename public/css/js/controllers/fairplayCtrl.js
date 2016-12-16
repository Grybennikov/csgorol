angular.module('gameApp').controller('fairplayCtrl', ['$scope', 'socketFactory', 'mainFactory', 'ngDialog', '$translate', function($scope, socketFactory, mainFactory, ngDialog, $translate){

	$scope.socket_cs = socketFactory.cs;

	$scope.checkHash = function() {
		$scope.socket_cs = socketFactory.cs;

		$scope.socket_cs.emit('checkHash', {
			roundHash : $scope.roundHash,
			roundNum : $scope.roundNum,
			roundPrice : $scope.roundPrice
		});

		$scope.socket_cs.once('checkHashResult', function(result){
			$scope.result = result;
			$scope.$digest();
		});

	}

		$scope.socket_cs.emit('informers');

		$scope.socket_cs.on('informers', function(data) {
			console.log(data);
			$scope.informer = data.informer;
			$scope.fairPplay = data.config;
			$scope.lastWinner = data.informer.lastWinner;
			$scope.currency = (data.config.currency == 'rur') ? 'руб.' : '$';
			$scope.$digest();
		});

}]);