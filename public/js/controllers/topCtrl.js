angular.module('gameApp').controller('topCtrl', function($scope, $http, socketFactory, mainFactory){

	$http.get('/api/user/game/top')
    .then(function(data) {
      data = data.data;
      console.log(data);
      $scope.topPlauers = data;
    })

});
