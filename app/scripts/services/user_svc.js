function UserSvc ($rootScope, $q, ApiSvc) {
	var user = function (key) {
		var self = this;
		if (typeof key === 'object') {
			self.id = key.id;
			self.data = key;
		} else {
			self.id = key;
		}
		self.ready = $q.defer();
		self.followings = [];
		self.followers = [];
		self.likes = [];

		// Only run data fetching if user data not already pulled
		if (typeof self.data === 'undefined') {
			self.init();
		}
	}

	user.prototype.init = function(userId) {
		$rootScope.loading = true;
		var self = this;
		var promises = [];

		self.get().then(function() {
			var currentPromise = null;

			// Get followings
			currentPromise = ApiSvc.getAll('users/' + 667485 + '/followings')
			currentPromise.then(function (res) {
				angular.forEach(res, function (result) {
					self.followings.push(new user(result));
				})
			});
			promises.push(currentPromise);

			// Get followers
			currentPromise = ApiSvc.getAll('users/' + self.id + '/followers')
			currentPromise.then(function (res) {
				angular.forEach(res, function (result) {
					self.followers.push(new user(result));
				})
			});
			promises.push(currentPromise);

			$q.all(promises).then(function() {
				$rootScope.loading = false;
				self.ready.resolve();
			})
		})
	}
	
	user.prototype.getLikes = function() {
		var self = this;
		var deferred = $q.defer();

		ApiSvc.get('users/' + self.id + '/favorites').then(function (res) {
			angular.forEach(res, function (result) {
				result.liked_by = self.data;
				self.likes.push(result);
			})
			deferred.resolve(self.likes);
			console.log(self.likes[0])
		})

		return deferred.promise;
	}

	user.prototype.get = function(force) {
		var self = this;
		var deferred = $q.defer();

		if (typeof self.data === 'undefined' || force) {
			if (typeof self.id === "number") {
				ApiSvc.get('users/' + self.id).then(function (res) {
					self.data = {};
					angular.copy(res, self.data);
					self.id = self.data.id;
					deferred.resolve()
				});
			} else {
				var username = self.id.toLowerCase().replace(" ", "");
				ApiSvc.resolve(username).then(function (res) {
					self.data = {};
					angular.copy(res, self.data);
					self.id = self.data.id;
					deferred.resolve()
				})
			}
		}
		
		return deferred.promise;
	}


	return user;
}

angular.module('scFriendsApp').factory('User', ['$rootScope', '$q', 'ApiSvc', UserSvc]);