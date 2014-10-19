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

			if (item.match(/^\d+$/)) {
				item = Number(item);
			} else {
				try {
					item = JSON.parse(item);
				} catch (err) {}
			}

			return item;
		}
	}
}

angular.module('scFriendsApp').service('StoreSvc', ['$q', StoreSvc]);