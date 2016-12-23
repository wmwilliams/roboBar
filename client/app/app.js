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
        $location.path('/drinkMenu');
      }, function error(res) {
        console.log(res);
      });
    }, function error(res) {
      console.log(res);
    });
  }
  $scope.toggleModal1 = function() {
    $scope.modalShown1 = !$scope.modalShown1;
  };
 $scope.userLogin = function() {
    $http.post('/api/auth', $scope.user).then(function success(res) {
      Auth.saveToken(res.data.token);
      if(res.data.token) {
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


.controller('menuCtrl', ['$scope', 'AllData', 'Auth', 'Alerts', '$http', '$location', '$window', '$route', function($scope, AllData, Auth, Alerts, $http, $location, $window, $route) {
  var socket = io.connect();
  $scope.drinkMenu = {};

  $scope.isLoggedIn = function() {
    if(Auth.isLoggedIn()) {
      return true;
    } else {
      return false;
    }
  };

  $scope.isRoot = function() {
    var user = Auth.currentUser();
    if(user) var userName = user._doc.name;
    if(userName !== "admin") {
      return false;
    } else if (userName === "admin") {
      return true;
    }
  };

  $scope.orderDrink = function() {
    console.log(this.drink.ingredients)
    console.log('DRINK IS BEING MADE');
    $scope.selectedDrink = this.drink.ingredients;
    socket.emit('drink', $scope.selectedDrink)
  };
  
  $scope.addFav = function(id) {
    $scope.user = Auth.currentUser();
    console.log(id.drink._id);
    var user = Auth.currentUser()._doc._id;
    $scope.favID = {
      RecipeId: id.drink._id,
      UserId: user
    };
    $http.post('/favs', $scope.favID);
  };

  $scope.removeHTML = function(drink) {
    console.log(drink);
    for(var i = 0;i < $scope.drinkMenu.length; i++) {
      if($scope.drinkMenu[i]._id === drink.id){
        $scope.drinkMenu.splice(i,1)
      } else {
        console.log("Not this one "+ $scope.drinkMenu[i]._id)
      }
    };
  };

  $scope.deleteDrink = function(id) {
    drinkId = {
      id: id.drink._id.toString()
    }
    $http.post('/drinks/:id', { data : drinkId.id});
    $scope.removeHTML(drinkId);
  };

  AllData.get(
    function success(data, stuff) {
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
  $scope.isRoot = function() {
    var user = Auth.currentUser();
    if(user) var userName = user._doc.name;
    if(userName !== "admin") {
      return false;
    } else if (userName === "admin") {
      return true;
    }
  };
  $scope.logout = function() {
    console.log('CLICK LOGOUT');
    Auth.removeToken();
  }  
}])

.controller('addCtrl', ['$scope', '$http', '$location', 'Auth', function($scope, $http, $location, Auth) {
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
    $scope.addDrink = function() {
      $http.post('/drinks', $scope.drink);
      $location.path('/drinkMenu');
    }
  // }

}])


.controller('favoritesCtrl', ['$scope', 'Auth', '$location', '$http', function($scope, Auth, $location, $http) {
  if(!Auth.currentUser()) {
      $location.path('/');
  } else {
    $scope.user = Auth.currentUser()._doc._id;
    var socket = io.connect();


    $http.post('/favs/:id', {userId : $scope.user}).then(
      function success(resp){
        $scope.drinks = resp;
      },function err (resp){
        console.log(resp);
      }
    );

    console.log('INSIDE FAV CONTROLLER');

    $scope.deleteDrink = function(id) {
      drinkId = {
        id: id.drink._id.toString()
      }
      $http.post('/drinks/:id', { data : drinkId.id});
      $route.reload();
    };

    $scope.orderDrink = function() {
      console.log(this.drink.ingredients)
      console.log('DRINK IS BEING MADE');
      $scope.selectedDrink = this.drink.ingredients;
      socket.emit('drink', $scope.selectedDrink)
    };

  }
}])








