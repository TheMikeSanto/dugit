'use strict';

function MainCtrl ($rootScope, $scope, $timeout, ApiSvc, User, StoreSvc) {
	$scope.likes = [];
	if (StoreSvc.get('username')) {
		var username = StoreSvc.get('username');
		user = new User(username);
		$scope.user = user;
		window.user = user;
	} else {
		$scope.user = false;
	}
	$scope.login = function (userId) {
		var user = new User(userId);
		$scope.user = user;
		window.user = user;

		user.ready().then(function() {
			user.fetchFollowingLikes();
			$scope.$watch('user.followings.likes.length', function (newVal) {
				$timeout(function() {
					$scope.likes = user.followings.likes;
				}, 100);
			})
		})
	}

	// user.getLikes().then(function (res) {
	// 	$scope.likes = res;
	// })

	$scope.friendlyTimeStamp = function (timeStamp) {
		var d = new Date(timeStamp),
			year = d.getFullYear(),
			month = d.getMonth(),
			day = d.getDate();

			if (month < 10) {
				month = "0" + month;
			}

		return [month, day, year].join("/");
	}
}

angular.module('scFriendsApp').controller('MainCtrl', ['$rootScope', '$scope', '$timeout', 'ApiSvc', 'User', 'StoreSvc', MainCtrl]);