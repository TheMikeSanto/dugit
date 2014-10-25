function ApiSvc ($q, $rootScope) {
	SC.initialize({
    client_id: "409b9d0dda12972b224f6a95105eda64"
  });

  var emptyResponseMsg = "Response empty"

	return {
		get: function (resource, params) {
			var deferred = $q.defer();

			SC.get('/' + resource, params, function (res) {
				if (res.errors) {
					deferred.reject(res.errors);
				} else if (res.length === 0) {
					deferred.reject(emptyResponseMsg);
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

			params.limit = 200;
			params.offset = offset;

			self.get(resource, params).then(function (res) {
				if (res.length === 0) {
					deferred.resolve(records);
				} else {
					records = records.concat(res);
					offset += res.length;
					self.getAll(resource, params, records, offset, deferred);
				}
			}, function (error) {
				if (error === emptyResponseMsg) {
					deferred.resolve(records);
				}
			})

			return deferred.promise;
		},
		resolve: function (path) {
			var url = "https://soundcloud.com/" + path;
			return this.get('resolve', {url: url});
		},
		clearLoads: function () {
			$rootScope.loads = [];
		},
		loadToggle: function (name) {
			if (typeof $rootScope.loads === 'undefined') {
				$rootScope.loads = [];
			}
			var loadIndex = $rootScope.loads.indexOf(name);
			if (loadIndex > -1) {
				$rootScope.loads.splice(loadIndex);
			} else {
				loadIndex = $rootScope.loads.push(name) - 1;
			}

			return loadIndex;
		},
		stream: function (trackId, options) {
			var deferred = $q.defer();

			SC.stream('/tracks/' + trackId, options, function (res) {
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

angular.module('scFriendsApp').service("ApiSvc", ['$q', '$rootScope', ApiSvc]);