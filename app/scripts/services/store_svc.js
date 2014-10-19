function StoreSvc ($q) {
	var prefix = "scf_";

	return {
		set: function (key, value) {
			key = prefix + key;
			localStorage[key] = JSON.stringify(value);
		},
		get: function (key) {
			var key = prefix + key,
				item = localStorage[key];

			try {
				var result = JSON.parse(item);
			} catch (err) {
				var result = item;
			}

			return item;
		}
	}
}

angular.module('scFriendsApp').service('StoreSvc', ['$q', StoreSvc]);