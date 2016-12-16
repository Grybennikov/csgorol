angular.module('gameApp').factory('socketFactory', function () {
	var socket = {};
	socket.cs = io();

	return socket;
});
