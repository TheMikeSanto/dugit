function UserSvc ($q, ApiSvc) {
	var user = function (userId) {
		var self = this;
		self.ready = $q.defer();
		self.id = userId;
		self.data = {};
		self.followings = [];
		self.followers = [];
		self.init();
	}

	user.prototype.get = function(userId) {
		var self = this;
		var deferred = $q.defer();

		if (typeof self.id === "number") {
			ApiSvc.get('users/' + self.id).then(function (res) {
				angular.copy(res, self.data);
				self.id = self.data.id;
				deferred.resolve()
			});
		} else {
			var username = self.id.toLowerCase().replace(" ", "");
			ApiSvc.resolve(username).then(function (res) {
				angular.copy(res, self.data);
				self.id = self.data.id;
				deferred.resolve()
			})
		}

		return deferred.promise;
	}

	user.prototype.init = function(userId) {
		var self = this;
		var promises = [];

		self.get(userId).then(function() {
			var currentPromise = null;

			// Get followings
			currentPromise = ApiSvc.getAll('users/' + 667485 + '/followings')
			currentPromise.then(function (res) {
				angular.copy(res, self.followings);
			});
			promises.push(currentPromise);

			// Get followers
			currentPromise = ApiSvc.getAll('users/' + self.id + '/followers')
			currentPromise.then(function (res) {
				angular.copy(res, self.followers);
			});
			promises.push(currentPromise);

			$q.all(promises).then(function() {
				self.ready.resolve();
			})
		})
	}
	

	return user;
}

angular.module('scFriendsApp').factory('User', ['$q', 'ApiSvc', UserSvc]);