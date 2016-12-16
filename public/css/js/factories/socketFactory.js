angular.module('gameApp').factory('socketFactory', function () {
	var socket = {};
	socket.cs = io(':8000');
	
	return socket;
});
