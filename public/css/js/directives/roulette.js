angular.module('gameApp').directive('roulette', ['$timeout', function ($timeout) {
 	return {
 		restrict: 'EA',
 		templateUrl: '/templates/roulette.html',
 		controller: 'rouletteCtrl',
 		scope: {
 			playersAttr: '=players',
 			timeAttr: '=time',
 			winnerAttr: '=winner'
 		},
 		link: function (scope, element, attrs) {
			// Animation stopped on 94-th element
			scope.startAnimation = function() {
				var 
					roulWidth = 7102,	// px
					totalTime = 13;		// sec
				var curTransition = roulWidth * (1 - scope.timeAttr / totalTime);

 				element.find('ul').css({
 					'margin-left': - curTransition + 'px',
 					'-webkit-transition': scope.timeAttr + 's',
 					'-moz-transition': scope.timeAttr + 's',
 					'-ms-transition': scope.timeAttr + 's',
 					'transition': scope.timeAttr + 's'

 				});

 				$timeout(function () {
	 				element.find('ul').css({
	 					'margin-left': - roulWidth + 'px'
		 			});
 				}, 0);
			}
 		}
 	};
}]);