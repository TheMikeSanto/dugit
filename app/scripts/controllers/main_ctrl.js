'use strict';

function MainCtrl ($scope, ApiSvc, User) {
	var user = new User(667485);
	$scope.user = user.data;
}

angular.module('scFriendsApp').controller('MainCtrl', ['$scope', 'ApiSvc', 'User', MainCtrl]);