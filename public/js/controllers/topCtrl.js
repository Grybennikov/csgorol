angular.module('gameApp').controller('topCtrl', function($scope, $http, socketFactory, mainFactory){
	$scope.socket_cs = socketFactory.cs;
	$scope.socket_dota = socketFactory.dota;
	$scope.datas =  mainFactory;


  $http.get('/api/user/game/top')
    .then(function(data) {
      data = data.data;
      console.log(data);
      $scope.topPlauers = data;
    })

	// render
	$scope.socket_cs.on('top', function(data) {
		angular.forEach(data ,function(value, key) {
			if (typeof value.stats.played !== 'undefined' && value.stats.played != 0) {
				data[key].stats.winrate = Math.round(value.stats.won/value.stats.played * 10000) / 100;
			} else {
				data[key].stats.winrate = 0;
			}
		});

		$scope.datas.topPlayers_cs = data;

		$scope.$digest();
	});

	// stuff
	// @todo remove
	if ($scope.datas.hideSdbr === 1) {
		$scope.datas.hideSdbr = 0;
	};

	if ($scope.datas.centerFull = 'full-width') {
		$scope.datas.centerFull = '';
	};
});
