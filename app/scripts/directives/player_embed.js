function playerEmbed($q, $rootScope, ApiSvc) {
	return {
		scope: true,
		templateUrl: 'templates/directives/player_embed.html',
		link: function (scope, element, attrs) {
			var progressContainer = element[0].querySelector('.progress');
			var progressBar = element[0].querySelector('.bar');

			angular.element(progressContainer).bind('click', function (e) {
				var percent = Math.floor((e.offsetX / progressContainer.offsetWidth) * 100);
				var duration = scope.track.sound.duration;
				var newPosition = duration * (percent/100);
				progressBar.style.width = percent + "%";
				scope.track.sound.setPosition(newPosition);
			})

			var setup = function (track) {
				var deferred = $q.defer();
				var progressBar = element[0].querySelector('.bar');
				ApiSvc.stream(track.id, {
					onplay: function() {
						progressContainer.className = progressContainer.className + " active";
						scope.track.playing = true;
					},
					onpause: function() {
						progressContainer.className = progressContainer.className.replace(/\bactive\b/, '');
						scope.track.playing = false;
					},
					onfinish: function() {
						progressContainer.className = progressContainer.className.replace(/\bactive\b/, '');
						progressBar.style.width = "0%";
						scope.$apply(function() {
							scope.currentTime = "";
							scope.track.playing = false;
						})
					},
					onresume: function() {
						scope.track.playing = true;
					},
					ondataerror: function() {
						progressContainer.className = progressContainer.className.replace(/\bactive\b/, '');
						scope.track.playing = false;
					},
					whileplaying: function() {
						var progress = ((this.position/this.duration) * 100) + "%";
						var seconds = (this.position/1000).toFixed(0);
						var minutes = (seconds/60).toFixed(0);
						if (minutes < 10) {
							minutes = "0" + minutes;
						}
						var remaining = seconds % 60;
						if (remaining < 10) {
							remaining = "0" + remaining;
						}
						scope.$apply(function() {
							scope.currentTime = minutes + ":" + remaining;
						});
						progressBar.style.width = progress;
					}
				}).then(function (sound) {
					scope.track.sound = sound;
					deferred.resolve(sound);
				})

				return deferred.promise;
			}
			scope.play = function () {
				if (angular.isUndefined(scope.track.sound)) {
					setup(scope.track).then(function() {
						scope.timestamp = "00:00";
						scope.track.sound.play();
					})
				} else {
					scope.timestamp = "00:00";
					scope.track.sound.play();				
				}
			}
			scope.pause = function () {
				scope.track.sound.pause();
				scope.track.playing = false;
			}
			scope.download = function (track) {
				alert(track.download_url);
			}
		}
	}
};

angular.module('scFriendsApp').directive('playerEmbed', ['$q', '$rootScope', 'ApiSvc', playerEmbed]);