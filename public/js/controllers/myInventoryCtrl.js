angular.module('gameApp').controller('myInventoryCtrl', function($scope, $http, Warehouse, socketFactory, mainFactory, ngNotify){

	$scope.socket_cs = socketFactory.cs;
	$scope.loading = true;
	$scope.inventorySumm = 0;

	$scope.selectItem = function (id, index) {
		if ($scope.inventoryItems[index].id == id) {
			$scope.inventoryItems[index].selected = !$scope.inventoryItems[index].selected;
		}
	}

	$scope.withdraw = function () {
		let items = $scope.inventoryItems.filter(function(item) {
			return item.selected
		});

		if (!items.length) {
			return ngNotify.set('Select the skins!!!', {
				type: 'error',
				duration: 2000
			})
		}
		$scope.loading = true;

		items = items.map(function(e){
			return e.steamId;
		});

		Warehouse.withdraw(items)
			.then(function(res){
				$scope.loading = false;
				ngNotify.set('Success', {
					type: 'success',
					duration: 2000
				});
				$scope.reloadInventory();
			})
			.catch(function(err){
				ngNotify.set(err.data.msg  || 'Server Error', {
				type: 'error',
					duration: 2000
				})
			})
	}

	$scope.reloadInventory = function () {
		$scope.loading = true;
		$scope.inventorySumm = 0;

		Warehouse.list()
			.then(function (items) {
				$scope.loading = false;
				$scope.inventoryItems = items;
				items.forEach(function(e){
					$scope.inventorySumm += e.price;
				})
			});
	}
	$scope.reloadInventory();

	$http.get('/api/jackpotGames/', {
			params: {
				current: true
			}
		})
		.then(function (data) {
			$scope.infConfig = data.data.settings;
		})


});