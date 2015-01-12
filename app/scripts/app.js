'use strict';

angular

  // module name and dependencies
  .module('ncsaas', [
    'config',
    'satellizer',
    'ngRoute',
    'ngCookies',])

  // urls
  .config(function($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/home.html',
      })

      .when('/login/', {
        templateUrl: 'views/login.html',
        controller: 'AuthCtrl'
      })

      .when('')

      .otherwise({
        redirectTo: '/'
      });
  })

  // social auth
  .config(function($authProvider) {

    $authProvider.facebook({
      clientId: '654736081301402', // '624059410963642',
      url: 'http://localhost:8080/api-auth/facebook/',
      redirectUri: 'http://localhost:8000'
    });

    $authProvider.google({
      clientId: '251636923168-9a6n6391j5vv5v4vf0m1k3n9sl9kag41.apps.googleusercontent.com',
      url: 'http://127.0.0.1:8080/api-auth/google/',
      redirectUri: 'http://127.0.0.1:8000'
    });

  });
