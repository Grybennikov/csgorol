angular.module('gameApp').controller('supportCtrl', ['$scope', 'socketFactory', 'mainFactory', 'ngDialog', '$translate', function($scope, socketFactory, mainFactory, ngDialog, $translate){

	$scope.checkHash = function() {
		$scope.socket_cs = socketFactory.cs;

		$scope.socket_cs.emit('checkHash', {
			roundHash : $scope.roundHash,
			roundNum : $scope.roundNum,
			roundPrice : $scope.roundPrice
		});

		$scope.socket_cs.once('checkHashResult', function(data){
			$scope.result = data.result;
			$scope.$digest();
		});
	}

}]);