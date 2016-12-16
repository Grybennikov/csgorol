angular.module('gameApp').directive('loadedItems', [function () {
	return {
		restrict: 'A',
		scope:true,
		link: function (scope, iElement, iAttrs) {
			iAttrs.$observe('loadedItems', function(value){
				var completed = value * 100/ scope.maxItems;
				iElement.css('width', completed+'%');
			});
		}
	};
}]);