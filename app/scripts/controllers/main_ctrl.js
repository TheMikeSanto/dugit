'use strict';

function MainCtrl ($rootScope, $scope, $timeout, $state, ApiSvc, User, StoreSvc) {
	$scope.likes = [];

	var afterUserReady = function() {
		$scope.user.ready().then(function() {
			$scope.user.fetchFollowingLikes();
			$scope.$watch('user.followings.likes.length', function (newVal) {
				$timeout(function() {
					if ($scope.user) {
						$scope.likes = $scope.user.followings.likes;
					}
				}, 100);
			})
		}, function (error) {
			$rootScope.errors.push(error);
			$state.go('main.user');
		})
	}

	var storedUserId = StoreSvc.get('userId');
	if (storedUserId) {
		$scope.user = new User(storedUserId);
		window.user = $scope.user;
		afterUserReady();
	} else {
		$state.go('main.user');
		$scope.user = false;
	}

	$scope.login = function (userId) {
		$rootScope.errors = [];
		$scope.user = new User(userId);
		window.user = $scope.user;
		afterUserReady();
		$state.go('main.home');
	}

	$scope.switchUser = function() {
		$scope.user = $scope.user.delete();
		$state.go('main.user');
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

angular.module('scFriendsApp').controller('MainCtrl', ['$rootScope', '$scope', '$timeout', '$state', 'ApiSvc', 'User', 'StoreSvc', MainCtrl]);