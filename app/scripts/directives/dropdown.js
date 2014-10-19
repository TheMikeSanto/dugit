function Dropdown() {
	return {
		scope: true,
		link: function(scope, element) {
			var menu = document.getElementById("finger-menu");
			var button = element.find('i')[0];
			var body = angular.element(document.querySelector('body'));
			var content = document.getElementById('likes');

			var toggleVisible = function () {
				scope.menu.visible = !scope.menu.visible;
				scope.$apply();
			};
			var unsetVisible = function () {
				scope.menu.visible = false;
				scope.$apply();
			}
			var showMenu = function () {
				var buttonClass = "fa fa-rotate-90"
				var buttonRegex = new RegExp("\\b" + buttonClass + "\\b");
				if (scope.menu.visible) {
					menu.style.display = 'block';
					button.className = button.className + " " + buttonClass;
					content.className = content.className + " blur-me";
				} else {
					menu.style.display = 'none';
					button.className = button.className.replace(buttonRegex, '');
					content.className = content.className.replace('blur-me', '');
				}
			};

			scope.menu = {visible: false};
			element.on('click', function(e) {
				e.stopPropagation();
				toggleVisible();
			});
			body.on('click', unsetVisible);
			scope.$watch('menu.visible', showMenu);
		}
	}
};

angular.module('scFriendsApp').directive('dropdown', Dropdown);