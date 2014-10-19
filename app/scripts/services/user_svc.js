function UserSvc ($rootScope, $q, $filter, ApiSvc, StoreSvc) {
	var user = function (key) {
		var self = this;
		if (typeof key === 'object') {
			self.id = key.id;
			self.data = key;
		} else {
			self.id = key;
		}
		self.followings = {
			likes: [],
			list: []
		};
		self.followers = [];
		self.fetched = false;
		self.readyPromise = $q.defer();

		// Only run data fetching if user data not already pulled
		if (typeof self.data === 'undefined') {
			self.init();
		} else {
			self.readyPromise.resolve();
		}
	}

	user.prototype.init = function(userId) {
		var loadName = 'userInit';
		var self = this;
		var promises = [];

		ApiSvc.loadToggle(loadName);

		self.fetch().then(function() {
			self.fetched = true;
			var currentPromise = null;

			// Get followings
			currentPromise = ApiSvc.getAll('users/' + self.id + '/followings')
			currentPromise.then(function (res) {
				angular.forEach(res, function (result) {
					self.followings.list.push(new user(result));
				})
				var orderBy = [
					'data.public_favorites_count', 
					'data.followers_count', 
					'data.track_count'
				]
				self.followings.list = $filter('orderBy')(self.followings.list, orderBy, true);
			});
			promises.push(currentPromise);

			// Get followers
			// currentPromise = ApiSvc.getAll('users/' + self.id + '/followers')
			// currentPromise.then(function (res) {
			// 	angular.forEach(res, function (result) {
			// 		self.followers.push(new user(result));
			// 	})
			// });
			// promises.push(currentPromise);

			$q.all(promises).then(function() {
				ApiSvc.loadToggle(loadName)
				self.readyPromise.resolve();
			})
		})
	}
	
	user.prototype.fetchFollowingLikes = function() {
		var loadName = 'followingLikes';
		var deferred = $q.defer();
		var self = this;
		var followingLikes = [];
		var promises = [];

		ApiSvc.loadToggle(loadName);

		angular.forEach(self.followings.list.slice(0,100), function (following, idx) {
			var promise = following.getLikes({limit: 1});
			console.log("getting likes for " + user.username + "(" + idx + "/100)");
			promise.then(function (likes) {
				var orderBy = ['created_at', 'favoritings_count'];
				self.followings.likes = self.followings.likes.concat(likes);
				self.followings.likes = $filter('orderBy')(self.followings.likes, orderBy, true);
			}, function (err) {
				console.log(error);
			})
			promises.push(promise);
		})

		$q.all(promises).then(function() {
			ApiSvc.loadToggle(loadName);
			deferred.resolve(self.likes);
		}, function() {
			alert('failed');
		});

		return deferred.promise;
	}

	user.prototype.getLikes = function(params) {
		var self = this;
		var deferred = $q.defer();

		ApiSvc.get('users/' + self.id + '/favorites', params).then(function (res) {
			angular.forEach(res, function (result) {
				result.liked_by = self.data;
			})
			deferred.resolve(res);
		})

		return deferred.promise;
	}

	user.prototype.fetch = function(force) {
		var self = this;
		var deferred = $q.defer();

		if (typeof self.data === 'undefined' || force) {
			if (typeof self.id === "number") {
				ApiSvc.get('users/' + self.id).then(function (res) {
					self.data = {};
					angular.copy(res, self.data);
					self.id = self.data.id;
					deferred.resolve()
				}, function (error) {
					var message = "Could not fetch user.";
					if (error) {
						message = error
					}
					deferred.reject(message);
				});
			} else {
				var username = self.id.toLowerCase().replace(" ", "");
				ApiSvc.resolve(username).then(function (res) {
					self.data = {};
					angular.copy(res, self.data);
					self.id = self.data.id;
					deferred.resolve()
				},function (error) {
					var message = "Could not fetch user."
					if (error) {
						message = error;
					}
					deferred.reject(message)
				})
			}
		}
		
		return deferred.promise;
	}

	user.prototype.ready = function() { return this.readyPromise.promise }

	return user;
}

angular.module('scFriendsApp').factory('User', ['$rootScope', '$q', '$filter', 'ApiSvc', 'StoreSvc', UserSvc]);