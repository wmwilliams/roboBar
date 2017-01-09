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
            controller: 'menuCtrl',
            resolve: {
              drinks: function(Drinks) {
                return Drinks.get();
            }
        }
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


.controller('homeCtrl', ['$scope', 'Auth', function($scope, Auth) {
	//Begin socket connection to back-end
	var socket = io.connect();

  $scope.isRoot = function() {
    var user = Auth.currentUser();
    if(user) var userName = user._doc.name;
      if(userName !== "admin") {
        return false;
      } else if (userName === "admin") {
        return true;
      }
    }
}])


.controller('menuCtrl', ['$scope', 'Auth', 'Alerts', '$http', '$location', '$window', '$route', 'Drinks', function($scope, Auth, Alerts, $http, $location, $window, $route, Drinks) {
  var socket = io.connect();

  Drinks.get().$promise.then(function(data){
   $scope.drinkMenu = data.drinks;
  });
  // console.log(Auth.currentUser());
  // console.log(Auth.getToken());
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
    // $scope.user = Auth.currentUser();
    console.log(id.drink._id);
    var user = Auth.currentUser()._doc._id;
    $scope.favID = {
      Recipe: id.drink._id,
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
    var   drinkId = {
      id: id.drink._id.toString()
    };
    $http.delete('/drinks/' + id.drink._id.toString()) 
    .success(function (data, status, headers) {
        console.log('------------------------SUCCESS----------------------');
        console.log(data);
    })
    .error(function (data, status, header, config) {
        console.log(data);
    });
    $scope.removeHTML(drinkId);
  };

}])


.controller('NavCtrl', ['$scope', 'Auth', 'Alerts', function($scope, Auth, Alerts) {
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
  $scope.logout = function() {
    console.log('CLICK LOGOUT');
    Auth.removeToken();
  }  
}])

.controller('addCtrl', ['$scope', '$http', '$location', 'Auth', 'Drinks', function($scope, $http, $location, Auth, Drinks) {
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

      $scope.newDrink = new Drinks();
      $scope.newDrink.data = $scope.drink;
    
      $scope.newDrink.$save(function(success, err) {
        if(err) console.log(err);
        else $location.path('/drinkMenu');
      })
    }

}])


.controller('favoritesCtrl', ['$scope', 'Auth', '$location', '$http', 'Drinks', function($scope, Auth, $location, $http, Drinks) {

  var socket = io.connect();
  console.log(JSON.stringify($scope.favorites));
  $scope.favorites = Auth.currentUser()._doc.favorites;
  $scope.results = [];

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

  function getResults(id) {
    $http({
      method: 'GET',
      url: "/drinks/" + id
    })
    .then(function(response) {
      $scope.results.push(response);
      console.log(response);
      console.log($scope.results);
      return response;
    });
  };
  function makeCall(array) {
    console.log('test');
    for(var i = 0; i < array.length; i++) {
      getResults(array[i]);
      console.log(array[i]);
    }
  };
 makeCall($scope.favorites);

  

  $scope.orderDrink = function() {
    console.log(this.drink.ingredients)
    console.log('DRINK IS BEING MADE');
    $scope.selectedDrink = this.drink.ingredients;
    socket.emit('drink', $scope.selectedDrink)
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
    var   drinkId = {
      id: id.drink._id.toString()
    };
    //REMOVE FROM USER FAVORITES ARRAY
    $scope.removeHTML(drinkId);
  };
}])
