function playerEmbed(ApiSvc) {
	return {
		scope: true,
		templateUrl: 'templates/directives/player_embed.html',
		link: function (scope, element, attrs) {
			scope.play = function (track) {
				var progressBar = element[0].querySelector('.bar');
				ApiSvc.stream(track.id, {
					whileplaying: function() {
						var progress = ((this.position/this.duration) * 100) + "%";
						progressBar.style.width = progress;
						console.log((this.position/this.duration) * 100);
					}
				}).then(function (sound) {
					scope.track.playing = true;
					scope.track.sound = sound;
					sound.play();
				})
			}
			scope.pause = function (sound) {
				sound.pause();
				scope.track.playing = false;
			}
			scope.download = function (track) {
				alert(track.download_url);
			}
		}
	}
};

angular.module('scFriendsApp').directive('playerEmbed', ['ApiSvc', playerEmbed]);