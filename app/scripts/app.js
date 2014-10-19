'use strict';

/**
 * @ngdoc overview
 * @name scFriendsApp
 * @description
 * # scFriendsApp
 *
 * Main module of the application.
 */
angular
  .module('scFriendsApp', [
    'ngAnimate',
    'ngResource',
    'ngSanitize',
    'ngTouch',
    'ui.router'
  ])
  .run(function ($rootScope) {
    $rootScope.loads = [];
    $rootScope.errors = [];
  })
  .config(function ($stateProvider, $urlRouterProvider) {
  	$urlRouterProvider.otherwise('/home');

  	$stateProvider
  		.state('main', {
  			templateUrl: 'templates/main.html',
  			controller: 'MainCtrl'
  		})
  		.state('main.home', {
  			url: '/home',
  			templateUrl: 'views/home.html'
  		})
  })
