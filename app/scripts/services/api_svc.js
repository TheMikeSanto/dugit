function ApiSvc ($q) {
	SC.initialize({
    client_id: "409b9d0dda12972b224f6a95105eda64"
  });

	return {
		get: function (resource, params) {
			var deferred = $q.defer();

			SC.get('/' + resource, params, function (res) {
				if (res.errors) {
					deferred.reject(res.errors);
				} else {
					deferred.resolve(res);
				}
			})

			return deferred.promise;
		},
		getAll: function (resource, params, records, offset, deferred) {
			var self = this;
			if (typeof deferred === 'undefined') {
				deferred = $q.defer();
			}
			if (typeof params === 'undefined') {
				params = {};
			}
			if (typeof records === 'undefined') {
				records = [];
			}
			if (typeof offset === 'undefined') {
				offset = 0;
			}

			params.offset = offset;

			self.get(resource, params).then(function (res) {
				if (res.length === 0) {
					deferred.resolve(records);
				} else {
					records = records.concat(res);
					offset += res.length;
					self.getAll(resource, params, records, offset, deferred);
				}
			})

			return deferred.promise;
		},
		resolve: function (path) {
			var url = "https://soundcloud.com/" + path;
			return this.get('resolve', {url: url});
		},
		stream: function (trackId) {
			var deferred = $q.defer();

			SC.stream('/tracks/' + trackId, function (res) {
				if (res.errors) {
					deferred.reject(res.errors);
				} else {
					deferred.resolve(res);
				}
			});

			return deferred.promise;
		},
		wrapper: function() {
			return SC;
		}
	}
}

angular.module('scFriendsApp').service("ApiSvc", ['$q', ApiSvc]);