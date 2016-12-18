
angular.module('gameApp').controller('historyCtrl',
  function($scope, $http, socketFactory, mainFactory){
	$scope.socket_cs = socketFactory.cs;
	$scope.datas =  mainFactory;

	$scope.history = [];

    $http.get('/api/jackpotGames/')
      .then(function(data) {
        data = data.data;
        console.log(data);
        $scope.history = data;
      })
});

