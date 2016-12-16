angular.module('gameApp').controller('myProfileCtrl', function($scope, socketFactory, mainFactory, ngDialog){
	$scope.profileInfo = {};
	$scope.socket_cs = socketFactory.cs;

	if ($scope.auth !== false) {
		$scope.socket_cs.emit('my-profile');

		$scope.socket_cs.on('my-profile', function(data) {
			if (data != null) {
				$scope.profileInfo = data;

				if (data.stats.played != 0) {
					$scope.profileInfo.stats.winrate = parseInt(data.stats.won) / parseInt(data.stats.played) * 100;
				} else {
					$scope.profileInfo.stats.winrate = 0;
				}
			}

			$scope.$digest();
		});
	}

	$scope.closeDialog = function(){
    	ngDialog.close();
    }
});