
angular.module('gameApp').controller('historyCtrl', function($scope, socketFactory, mainFactory){
	$scope.socket_cs = socketFactory.cs;
	$scope.datas =  mainFactory;

	$scope.history = [];

	$scope.socket_cs.emit('get-history');

	$scope.socket_cs.on('history', function(data) {
		console.log(data);
		$scope.history = data;
		$scope.$digest();
	});
	
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

