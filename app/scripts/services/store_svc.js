function StoreSvc ($q) {
	var prefix = "scf_";

	return {
		set: function (key, value) {
			key = prefix + key;
			localStorage[key] = JSON.stringify(value);
		},
		get: function (key) {
			var key = prefix + key;
			var item = localStorage[key];

			if (item && item.match(/^\d+$/)) {
				item = Number(item);
			} else {
				try {
					item = JSON.parse(item);
				} catch (err) {}
			}

			return item;
		},
		delete: function (key) {
			var key = prefix + key;
			localStorage.removeItem(key);
		}
	}
}

angular.module('scFriendsApp').service('StoreSvc', ['$q', StoreSvc]);