angular.module('gameApp').controller('aboutCtrl', function($scope, socketFactory, mainFactory){	
	$scope.socket = socketFactory;
	$scope.datas =  mainFactory;

	if ($scope.datas.hideSdbr === 1) {
		$scope.datas.hideSdbr = 0;
	};

	if ($scope.datas.centerFull = 'full-width') {
		$scope.datas.centerFull = '';
	};
});