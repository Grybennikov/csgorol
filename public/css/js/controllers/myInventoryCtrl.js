angular.module('gameApp').controller('myInventoryCtrl', function($scope, socketFactory, mainFactory){

	$scope.socket_cs = socketFactory.cs;
	$scope.loading = true;

	$scope.socket_cs.emit('my-inventory');
	$scope.socket_cs.on('my-inventory', function(data){
		if (typeof data.items != 'undefined' && typeof data.total != 'undefined') {
			var items = data.items;
			angular.forEach(items, function(value, key) {
				if (typeof value.name != 'undefined' && typeof value.market_hash_name != 'undefined') {
					value.quality = value.market_hash_name.substr(value.name.length+1);
					if (value.quality.length == 0) {
						value.quality = '-';
					}

				} else {
					value.quality = '-';
				}
			});

			$scope.inventorySumm = data.total;
			$scope.inventoryItems = items;
			$scope.loading = false;
			
			$scope.$digest();
		}
	});

	$scope.sum = 0;
	$scope.inventoryItems = [];
});