angular.module('mean.system')
  .controller('IndexController', ['$scope', 'Global', '$location', 
  'socket', 'game', 'AvatarService', '$http', '$route', 'tokenAuth', 
    function ($scope, Global, $location, socket, game, 
    AvatarService, $http, $route, tokenAuth) {
    $scope.global = Global;

    $scope.playAsGuest = function () {
      game.joinGame();
      $location.path('/app');
    };

    $scope.showError = function () {
      if ($location.search().error) {
        return $location.search().error;
      } else {
        return false;
      }
    };

    $scope.hideInput = true;
    $scope.showEmail = $location.search().email;
    $scope.gameId = $location.search().game;

    $scope.avatars = [];
    AvatarService.getAvatars()
      .then(function (data) {
        $scope.avatars = data;
      });

    // $scope.isAuthenticated = tokenAuth.isAuthenticated();
		$scope.isAuthenticated = window.user;
		
    $scope.logout = () => {
      tokenAuth.deleteToken('authToken');
      $location.path('/');
      $route.reload();
    };
  }]);
