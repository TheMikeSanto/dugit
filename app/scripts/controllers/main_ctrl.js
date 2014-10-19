'use strict';

function MainCtrl ($rootScope, $scope, $timeout, ApiSvc, User, StoreSvc) {
	$scope.likes = [];

	var afterUserReady = function() {
		$scope.user.ready().then(function() {
			$scope.user.fetchFollowingLikes();
			$scope.$watch('user.followings.likes.length', function (newVal) {
				$timeout(function() {
					$scope.likes = $scope.user.followings.likes;
				}, 100);
			})
		})
	}

	var storedUserId = StoreSvc.get('userId');
	if (storedUserId) {
		$scope.user = new User(storedUserId);
		window.user = $scope.user;
		afterUserReady();
	} else {
		$scope.user = false;
	}

	$scope.login = function (userId) {
		$scope.user = new User(userId);
		window.user = $scope.user;
		afterUserReady();
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