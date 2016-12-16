
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



	// if ($scope.datas.hideSdbr === 1) {
	// 	$scope.datas.hideSdbr = 0;
	// };

	// if ($scope.datas.centerFull = 'full-width') {
	// 	$scope.datas.centerFull = '';
	// };

	$scope.hoverIn = function(){
       this.hoverEdit = true;
    };

    $scope.hoverOut = function(){
        this.hoverEdit = false;
    };
});

