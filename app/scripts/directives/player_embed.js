function playerEmbed($q, $rootScope, ApiSvc) {
	return {
		scope: true,
		templateUrl: 'templates/directives/player_embed.html',
		link: function (scope, element, attrs) {
			var container = element[0];
			var parent = container.parentElement;
			var progressContainer = container.querySelector('.progress');
			var progressBar = container.querySelector('.bar');
			scope.currentTime = "00:00";

			container.className = container.className + ' player-embed';
			container.setAttribute('track-id', scope.track.id);

			angular.element(progressContainer).bind('click', function (e) {
				var percent = Math.floor((e.offsetX / progressContainer.offsetWidth) * 100);
				var duration = scope.track.sound.duration;
				var newPosition = duration * (percent/100);
				progressBar.style.width = percent + "%";
				scope.track.sound.setPosition(newPosition);
			})

			$rootScope.$on('playStart', function (e, data) {
				if (scope.track.id !== data.currentTrackId) {
					if (angular.isDefined(scope.track.sound)) {
						stopPlay();
					}
				}
			});

			$rootScope.$on('playNext', function (e, data) {
				if (Number(scope.track.id) === Number(data.trackId)) {
					setup().then(function() {
						startPlay();
					})
				}
			})

			var setup = function () {
				var deferred = $q.defer();
				var progressBar = element[0].querySelector('.bar');
				ApiSvc.stream(scope.track.id, {
					onplay: function() {
						parent.className = parent.className + " playing";
						container.className = container.className + " playing";
						progressContainer.className = progressContainer.className + " active";
						scope.track.playing = true;
						scope.track.paused = false;
					},
					onpause: function() {
						progressContainer.className = progressContainer.className.replace(/\bactive\b/, '');
						scope.track.playing = false;
						scope.track.paused = true;
					},
					onfinish: function() {
						progressContainer.className = progressContainer.className.replace(/\bactive\b/, '');
						progressBar.style.width = "0%";
						scope.$apply(function() {
							scope.currentTime = "";
							scope.track.playing = false;
						})

						var nextTrackId = container.nextElementSibling.getAttribute('track-id');
						$rootScope.$emit('playNext', {trackId: nextTrackId});
					},
					onresume: function() {
						scope.track.playing = true;
						scope.track.paused = false;
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

						if (this.duration > 0) {
							scope.$apply(function() {
								scope.currentTime = minutes + ":" + remaining;
							});
						}
						progressBar.style.width = progress;
					}
				}).then(function (sound) {
					scope.track.sound = sound;
					deferred.resolve(sound);
				})

				return deferred.promise;
			}

			var startPlay = function() {
				$rootScope.$emit('playStart', {currentTrackId: scope.track.id});
				scope.track.sound.play();
			}

			var stopPlay = function() {
				scope.track.sound.stop();
				progressContainer.className = progressContainer.className.replace(/\bactive\b/, '');
				parent.className = parent.className.replace(/\bplaying\b/, '');
				container.className = container.className.replace(/\bplaying\b/, '');
				progressBar.style.width = "0%";
				scope.currentTime = "";
				scope.track.playing = false;
				scope.track.paused = false;
			}

			scope.play = function () {
				if (angular.isUndefined(scope.track.sound)) {
					setup(scope.track).then(function() {
						startPlay();
					})
				} else {
					startPlay();
				}
			}
			scope.pause = function () {
				scope.track.sound.pause();
			}
			scope.download = function () {
				ApiSvc.download(scope.track.id);
			}
		}
	}
};

angular.module('scFriendsApp').directive('playerEmbed', ['$q', '$rootScope', 'ApiSvc', playerEmbed]);