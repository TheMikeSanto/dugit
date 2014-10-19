function UserSvc ($rootScope, $q, $filter, ApiSvc, StoreSvc) {
	var user = function (key) {
		var self = this;
		self.id = key;
		self.data = null;
		self.followings = {
			likes: [],
			list: []
		};
		self.followers = [];
		self.fetched = false;
		self.readyPromise = $q.defer();

		// For creating users with data already fetched from SC
		if (typeof key === 'object') {
			self.id = key.id;
			self.data = key;
		}

		// Only run data fetching if user data not already pulled
		if (self.data === null) {
			self.init().then(function() {
				StoreSvc.set('userId', self.id);
				self.readyPromise.resolve();
			});
		} else {
			self.readyPromise.resolve();
		}
	}

	user.prototype.init = function(userId) {
		var self = this;
		var loadName = 'userInit';
		var promises = [];

		ApiSvc.loadToggle(loadName);

		self.fetch().then(function() {
			self.fetched = true;

			promises.push(self.fetchFollowings());
			// promises.push(self.fetchFolloers());

			$q.all(promises).then(function (res) {
				ApiSvc.loadToggle(loadName)
				self.readyPromise.resolve(res);
			}, function (error) {
				ApiSvc.loadToggle(loadName);
				self.readyPromise.reject(error);
			})
		})

		return self.readyPromise.promise;
	}

	user.prototype.delete = function() {
		var self = this;
		StoreSvc.delete('userId');
		ApiSvc.clearLoads();
		return null;
	}

	user.prototype.fetch = function(force) {
		var self = this;
		var deferred = $q.defer();

		if (self.data === null || force) {
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

	user.prototype.fetchFollowers = function () {
		var self = this;
		var deferred = $q.defer();

		ApiSvc.getAll('users/' + self.id + '/followers')
			.then(function (res) {
				angular.forEach(res, function (result) {
					self.followers.push(new user(result));
				})
				deferred.resolve(self.followers);
			}, function (error) {
				deferred.reject(error);
			});

		return deferred.promise;
	}

	user.prototype.fetchFollowings = function() {
		var self = this;
		var deferred = $q.defer();

		ApiSvc.getAll('users/' + self.id + '/followings')
			.then(function (res) {
				angular.forEach(res, function (result) {
					self.followings.list.push(new user(result));
				})
				var orderBy = [
					'data.public_favorites_count', 
					'data.followers_count', 
					'data.track_count'
				]
				self.followings.list = $filter('orderBy')(self.followings.list, orderBy, true);
				deferred.resolve(self.followings.list);
			}, function (error) {
				deferred.reject(error);
			});

		return deferred.promise;	
	}

	user.prototype.fetchFollowingLikes = function() {
		var loadName = 'followingLikes';
		var deferred = $q.defer();
		var self = this;
		var followingLikes = [];
		var promises = [];

		ApiSvc.loadToggle(loadName);

		angular.forEach(self.followings.list.slice(0,100), function (following, idx) {
			var promise = following.fetchLikes({limit: 1});
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
		}, function(err) {
			deferred.reject(err);
		});

		return deferred.promise;
	}

	user.prototype.fetchLikes = function(params) {
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

	user.prototype.ready = function() { return this.readyPromise.promise }

	return user;
}

angular.module('scFriendsApp').factory('User', ['$rootScope', '$q', '$filter', 'ApiSvc', 'StoreSvc', UserSvc]);