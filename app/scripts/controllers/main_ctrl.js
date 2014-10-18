'use strict';

function MainCtrl ($rootScope, $scope, ApiSvc, User) {
	var user = new User(667485);
	$scope.user = user;
	window.user = user;
	user.getLikes().then(function (res) {
		$scope.likes = res;
	})
}

angular.module('scFriendsApp').controller('MainCtrl', ['$rootScope', '$scope', 'ApiSvc', 'User', MainCtrl]);