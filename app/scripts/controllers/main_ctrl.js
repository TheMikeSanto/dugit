'use strict';

function MainCtrl ($rootScope, $scope, ApiSvc, User) {
	$scope.user = new User(667485);
}

angular.module('scFriendsApp').controller('MainCtrl', ['$rootScope', '$scope', 'ApiSvc', 'User', MainCtrl]);