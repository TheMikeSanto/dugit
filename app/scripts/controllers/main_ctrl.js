'use strict';

function MainCtrl ($scope) {
	$scope.message = "hey";
}

angular.module('scFriendsApp').controller('MainCtrl', ['$scope', MainCtrl]);