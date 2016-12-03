var app = angular.module('BarBot', ['mainCtrls', 'ngRoute', 'BarServices', 'ui.bootstrap', 'door3.css', 'ngAnimate']);

app.directive('modalDialog', function() {
  return {
    restrict: 'E',
    scope: {
    show: '='
  },
  replace: true,
  transclude: true,
  link: function($scope, element, attrs) {
    $scope.hideModal = function() {
      $scope.show = false;
    };
  },
  template: "<div class='ng-modal' ng-show='show'><div class='ng-modal-overlay' ng-click='hideModal()'></div><div class='ng-modal-dialog' ng-style='dialogStyle'><div class='ng-modal-dialog-content' ng-transclude></div></div></div>"
  };
});

app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
        $routeProvider
        .when('/', {
            templateUrl: 'app/views/home.html',
            controller: 'homeCtrl'
        })        
        .when('/drinkMenu', {
            templateUrl: 'app/views/drinkMenu.html',
            controller: 'menuCtrl'
        })
        .when('/add', {
            templateUrl: 'app/views/add.html',
            controller: 'addCtrl'
        })        
        .when('/favorites', {
            templateUrl: 'app/views/favorites.html',
            controller: 'favoritesCtrl'
        })
        .otherwise({
            templateUrl: 'app/views/404.html'
        });
        $locationProvider.html5Mode({
          enabled: true,
          requireBase: false
        });
    }
]);

angular.module('mainCtrls', ['BarServices'])

.controller('UserCtrl', ['$scope', '$http', '$location', 'Alerts', 'Auth',  function($scope, $http, $location, Alerts, Auth) {
  $scope.modalShown1 = false;
  $scope.user = {
    email: '',
    password: ''
  };
  $scope.userSignup = function() {
    $http.post('/api/users', $scope.user).then(function success(res) {
      $http.post('/api/auth', $scope.user).then(function success(res) {
        Auth.saveToken(res.data.token);
        console.log(res.data.token);
        console.log(Auth.isLoggedIn());
        $location.path('/drinkMenu');
      }, function error(res) {
        console.log(data);
      });
    }, function error(res) {
      console.log(data);
    });
  }
  $scope.toggleModal1 = function() {
    $scope.modalShown1 = !$scope.modalShown1;
  };
 $scope.userLogin = function() {
    $http.post('/api/auth', $scope.user).then(function success(res) {
      Auth.saveToken(res.data.token);
      if(res.data.token) {
        console.log(res.data.token);
        console.log(Auth.isLoggedIn());
        $location.path('/drinkMenu');
      } else {
        console.log('failure');
      }
    }, function error(res) {
      console.log(data);
      alert('Login Failure! Please try again.')
    });
  }
  $scope.modalShown = false;
  $scope.toggleModal = function() {
    $scope.modalShown = !$scope.modalShown;
  };
}])


.controller('homeCtrl', ['$scope', function($scope) {
	//Begin socket connection to back-end
	var socket = io.connect();
	$scope.test = 'TEST';
	//Socket test, this should console log a message in terminal (backend)
	$scope.buttonClick = function (event) {
		console.log('CLICK');
		socket.emit('news', $scope.test);
	    // socket.emit('my other event', { my: 'data' });
	};

}])


.controller('menuCtrl', ['$scope', 'AllData', function($scope, AllData) {
	
  $scope.drinkMenu = {};
  //Begin socket connection to back-end
  var socket = io.connect();
	$scope.test = 'TEST';
	//Socket test, this should console log a message in terminal (backend)
	$scope.buttonClick = function (event) {
		console.log('CLICK');
		socket.emit('news', $scope.test);
	    // socket.emit('my other event', { my: 'data' });
	};

  AllData.get(
    function success(data, stuff) {
      console.log(data);
      $scope.drinkMenu = data.drinks;
    },
    function error(data) {
      console.log(data);
    }
  );

}])


.controller('NavCtrl', ['$scope', 'Auth', 'Alerts', function($scope, Auth, Alerts) {

  $scope.isLoggedIn = function() {
    if(Auth.currentUser()) {
      return true;
    } else {
      return false;
    }
  };
  $scope.logout = function() {
    console.log('CLICK LOGOUT');
    Auth.removeToken();
  }  
}])

.controller('addCtrl', ['$scope', '$http', 'AllData', function($scope, $http, AllData) {
	console.log('ADD DRINK CONTROLLER');

  $scope.drink = {
    title: '',
    description: '',
    img: '',
    extra: '',
    ingredients: {
      alcohol : {
        whiskey: '',
        gin: '',
        vodka: '',
        rum: '',
        tequila: '',
        scotch: ''
      },
    mixer : {
        clubSoda: '',
        tonic: '',
        cola: '',
        gingerAle: '',
        orangeJuice: '',
        cranberry: ''
      }
    }
  };

  $scope.submitDrink = function() {
    console.log('Add drink into database');
    console.log($scope.drink);
    $http.post('/api/drink', $scope.drink);
  }
  


}])


.controller('favoritesCtrl', ['$scope', function($scope) {
  console.log('INSIDE FAV CONTROLLER');
}])








