var app = angular.module('BarBot', ['mainCtrls', 'ngRoute', 'BarServices', 'ui.bootstrap', 'door3.css', 'ngAnimate', 'ngFlash', 'angularModalService', 'chart.js']);
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
        .when('/reports', {
            templateUrl: 'app/views/reports.html',
            controller: 'reportsCtrl'
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
.controller('ModalController', function($scope, close) {

    $scope.close = function(result) {
      close(result, 500);
    }
})
.controller('userCtrl', ['$scope', '$timeout', '$http', '$location', 'Alerts', 'Auth', '$rootScope', 'Flash', 'ModalService', function($scope, $timeout, $http, $location, Alerts, Auth, $rootScope, Flash, ModalService) {
  $scope.modalShown1 = false;
  $scope.user = {
    email: '',
    password: ''
  };
  $scope.loginSuccess = function() {
    var message = 'You have successfully logged on, welcome!';
    Flash.create('loginSuccess', message);
  };
  $scope.userSignup = function() {
    $http.post('/api/users', $scope.user).then(function success(res) {
      $http.post('/api/auth', $scope.user).then(function success(res) {
        Auth.saveToken(res.data.token);
        if(res.data.token) {
          $scope.loginSuccess();
          $timeout(function(){
            $location.path('/drinkMenu'); //or elemement
          }, 250);
        } else {
          console.log('failure');
        }
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
        $scope.loginSuccess();
        $timeout(function(){
          $location.path('/drinkMenu'); //or elemement
        }, 250);
      } else {
        console.log('failure');
      }
    }, function error(res) {
      alert('Login Failure! Please try again.')
    })
  };
}])
.controller('homeCtrl', ['$scope', '$http', '$location', 'Alerts', 'Auth', '$rootScope', 'Flash', 'ModalService', function($scope, $http, $location, Alerts, Auth, $rootScope, Flash, ModalService) {

  $scope.isRoot = function() {
  var user = Auth.currentUser();
  if(user) var userName = user._doc.name;
    if(userName !== "admin") {
      return false;
    } else if (userName === "admin") {
      return true;
    }
  };

  $scope.show = function() {
      ModalService.showModal({
          templateUrl: 'modal.html',
          controller: "ModalController"
      }).then(function(modal) {
          modal.element.modal();
          modal.close.then(function() {
            return;
          });
      });
  };
  $scope.show1 = function() {
    ModalService.showModal({
        templateUrl: 'modal1.html',
        controller: "ModalController"
    }).then(function(modal) {
        modal.element.modal();
        modal.close.then(function() {
          return;
        });
    });
  };

}])
.controller('menuCtrl', ['$scope', 'Auth', 'Alerts', '$http', '$location', '$window', '$route', 'Drinks', '$rootScope', 'Flash', 'ModalService', function($scope, Auth, Alerts, $http, $location, $window, $route, Drinks, $rootScope, Flash, ModalService) {
  var socket = io.connect();
  $scope.message = {
    title: "",
    body: ""
  };
  Drinks.get().$promise.then(function(data){
   $scope.drinkMenu = data.drinks;
  })
  $scope.isLoggedIn = function() {
    if(Auth.isLoggedIn()) {
      return true;
    } else {
      return false;
    }
  };
<<<<<<< HEAD

  $scope.show = function(template) {
      ModalService.showModal({
          templateUrl: template,
          controller: "ModalController"
      }).then(function(modal) {
          modal.element.modal();
          modal.close.then(function() {
            return;
          });
      });
  };
  function orderSuccess() {
    $scope.show('orderSuccess.html');
  };
  function orderFailure() {
    $scope.show('orderFailure.html');
  };

  $scope.favSuccess = function(drink) {
    var message = '<strong>Success!</strong> '+ drink +' was added to your personal list.';
    Flash.create('favSuccess', message);
  };
  $scope.favFailure = function(drink) {
    var message = '<strong>Failure!</strong> '+ drink +' was NOT added to your favorites list.';
    Flash.create('favFailure', message);
  };
  $scope.deleteSuccess = function(drink) {
    var message = '<strong>Success!</strong> '+ drink +' was successfully deleted from the menu.';
    Flash.create('deleteSuccess', message);
  };
  $scope.deleteFailure = function(drink) {
    var message = '<strong>FAILURE!</strong> '+ drink +' was not deleted from the menu.';
    Flash.create('deleteFailure', message);
=======
  $scope.orderSuccess = function() {
    var message = '<strong>Success!</strong> Your drink should be on the way soon.';
    Flash.create('orderSuccess', message);
  };
  $scope.favSuccess = function(drink) {
    var message = '<strong>Success!</strong> '+ drink +' was added to your personal list.';
    Flash.create('orderSuccess', message);
  };
  $scope.favFailure = function(drink) {
    var message = '<strong>Failure!</strong> '+ drink +' was NOT added to your favorites list.';
    Flash.create('orderSuccess', message);
  };
  $scope.deleteSuccess = function(drink) {
    var message = '<strong>Success!</strong> '+ drink +' was successfully deleted from the menu.';
    Flash.create('orderSuccess', message);
  };
  $scope.deleteFailure = function(drink) {
    var message = '<strong>FAILURE!</strong> '+ drink +' was not deleted from the menu.';
    Flash.create('orderSuccess', message);
>>>>>>> 56c4115d9157d1963b5559086ed314763146a035
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

<<<<<<< HEAD
  $scope.orderDrink = function () {
=======
  $scope.orderDrink = function() {
    console.log(this.drink.ingredients)
    console.log('DRINK IS BEING MADE');
>>>>>>> 56c4115d9157d1963b5559086ed314763146a035
    $scope.selectedDrink = {
      drink : this.drink.ingredients,
      title : this.drink.title,
      user : Auth.currentUser()._doc._id
    };
<<<<<<< HEAD
    socket.emit('drink', $scope.selectedDrink);
  };

  socket.on('message', function(data) {
    readMessage(data);
  });

  function readMessage(info) {
    console.log(info);
    if(info.message.toString() === "failure") {
      console.log("Failure");
      orderFailure();
    } else if(info.message.toString() === "success"){
      console.log("Success");
      orderSuccess();
    } else {
      console.log(info.message.toString());
    };
=======
    socket.emit('drink', $scope.selectedDrink)
    $scope.orderSuccess();
>>>>>>> 56c4115d9157d1963b5559086ed314763146a035
  };

  $scope.addFav = function(id) {
    $scope.fav = {
      user : Auth.currentUser()._doc._id,
      drink : this.drink
    };
    $http.post('/favorites', $scope.fav)
    .then(function(success) {
      $scope.favSuccess(id.drink.title);
    }, function(error) {
      $scope.favFailure(id.drink.title);
    });
  };

  $scope.removeHTML = function(drink) {
    for(var i = 0; i < $scope.drinkMenu.length; i++) {
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
    .then(function(success) {
      $scope.deleteSuccess(id.drink.title);
      $scope.removeHTML(drinkId);
    }, function(error) {
      $scope.deleteFailure(id.drink.title);
      console.log(rejection.data);
    });
  }

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
    Auth.removeToken()
  }
}])
.controller('reportsCtrl', ['$scope', '$http', 'Auth', function($scope, $http, Auth) {
  $scope.userData = Auth.currentUser()._doc._id;
  $scope.users;

  $http.get('/api/users').then(
    function(response){
      $scope.users=response.data
    }
  )
  $scope.totalData = function() {
    $scope.data = [];
    $scope.results = [];
    $http.get('/drinks')
      .then(function(response) {
        $scope.totals = {};
        $scope.titles = [];
        $scope.drinks = response.data.drinks;
        for(var i = 0; i < $scope.drinks.length; i++) {
          $scope.titles.push($scope.drinks[i].title)
          $scope.totals[$scope.drinks[i].title] = 0;
        }
      })
    $http.get('/drink-reports')
      .then(function(response) {
        $scope.results = response.data.drinks;
        $scope.readReport($scope.results, $scope.titles);
    });
  };
  $scope.totalData();

  $scope.getUserData = function(userID) {
    $scope.data = [];
    $scope.results = [];
    $http.get('/drinks')
      .then(function(response) {
        $scope.totals = {};
        $scope.titles = [];
        $scope.drinks = response.data.drinks;
        for(var i = 0; i < $scope.drinks.length; i++) {
          $scope.titles.push($scope.drinks[i].title)
          $scope.totals[$scope.drinks[i].title] = 0;
        }
      })
    $http.get('/drink-reports/'+ userID)
      .then(function(response) {
        $scope.results = response.data.drinks;
        $scope.readReport($scope.results, $scope.titles);
    });

  };
  // $scope.getUserData($scope.userData);
  $scope.changedValue=function(item){
    $scope.getUserData(item.user.id);
  }

  $scope.readReport = function(arr, arr2) {
    for(var i = 0; i < arr.length; i++) {
      for(var x = 0; x < arr2.length; x++) {
        if(arr[i].drink === arr2[x]) {
            $scope.totals[arr2[x]] +=1
        }
      }
    }
    for(drink in $scope.totals) {
      $scope.data.push($scope.totals[drink]);
    }
    $scope.labels = $scope.titles;
    $scope.series = ['Drinks'];
  };

  $scope.liquidReports = function() {
    $http.get('/liquid-reports')
      .then(function(response) {
        $scope.liquidTotals = response.data;
        $scope.reportLiquid($scope.liquidTotals);
      })
  };
  $scope.liquidReports();
  $scope.reportLiquid = function(arr) {
    $scope.liquidLabels = [];
    $scope.liquidData = [];
    for(var i=0; i < arr.length; i++) {
      $scope.liquidLabels.push(arr[i].name);
      $scope.liquidData.push(arr[i].volume)
    }
  };
  $scope.clearReports = function(id) {
    if(id) {
      $http.delete('/drink-reports/'+this.user.id).then(function success() {
        $scope.totalData();
      })
    } else {
      $http.delete('/drink-reports/').then(function success() {
        $scope.totalData();
      })
    }
  }
  $scope.refillIngredient = function(ingredient) {
    $http.delete('/liquid-reports/'+ingredient.toLowerCase()).then(function success() {
      $scope.liquidReports();
    })
  }

}])
.controller('addCtrl', ['$scope', '$http', '$location', 'Auth', '$rootScope', 'Flash', function($scope, $http, $location, Auth, $rootScope, Flash) {
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
    $scope.addSuccess = function(drink) {
      var message = '<strong>Success!</strong> '+ drink +' was added to the drink menu.';
      Flash.create('orderSuccess', message);
    };

    $scope.addDrink = function() {
      $http.post('/drinks', $scope.drink);
      $scope.addSuccess($scope.drink.title);
      $location.path('/drinkMenu');
    }

}])


.controller('favoritesCtrl', ['$scope', 'Auth', '$location', '$http', 'Drinks', '$rootScope', 'Flash', function($scope, Auth, $location, $http, Drinks, $rootScope, Flash) {

  var socket = io.connect();
  $scope.isLoggedIn = function() {
    if(Auth.isLoggedIn()) {
      return true;
    } else {
      return false;
    }
  };
  $scope.results = {};
  $scope.deleteSuccess = function(drink) {
  	var message = '<strong>Success!</strong> '+ drink +' was successfully deleted from the menu.';
  	Flash.create('orderSuccess', message);
  };
  $scope.deleteFailure = function(drink) {
  	var message = '<strong>FAILURE!</strong> '+ drink +' was not deleted from the menu.';
  	Flash.create('orderSuccess', message);
  };
  $scope.orderSuccess = function() {
  	var message = '<strong>Success!</strong> Your drink should be on the way soon.';
  	Flash.create('orderSuccess', message);
  };
<<<<<<< HEAD
  $scope.orderFailure = function() {
  	var message = '<strong>Failure!</strong> Wait a minute or two and try again, robot is making someone elses drink!';
  	Flash.create('orderSuccess', message);
  };
=======
>>>>>>> 56c4115d9157d1963b5559086ed314763146a035
  $scope.isRoot = function() {
    var user = Auth.currentUser();
    if(user) var userName = user._doc.name;
    if(userName !== "admin") {
      return false;
    } else if (userName === "admin") {
      return true;
    }
  };
  $http.get('/favorites/'+ Auth.currentUser()._doc._id)
    .then(function(response) {
      $scope.results = response.data.drinks;
  });
<<<<<<< HEAD

  // socket.on('fail', function(){
  //   $scope.orderFailure();
  // })
  // socket.on('success', function(){
  //   console.log('success function');
  //   $scope.orderSuccess();
  // })
=======
>>>>>>> 56c4115d9157d1963b5559086ed314763146a035

  $scope.orderDrink = function() {
    console.log(this.drink.ingredients)
    console.log('DRINK IS BEING MADE');
    $scope.selectedDrink = {
      drink : this.drink.ingredients,
      title : this.drink.title,
      user : Auth.currentUser()._doc._id
    };
    socket.emit('drink', $scope.selectedDrink)
<<<<<<< HEAD
    // $scope.orderSuccess();
=======
    $scope.orderSuccess();
>>>>>>> 56c4115d9157d1963b5559086ed314763146a035
  }
  $scope.removeHTML = function(drink) {
    console.log(drink)
  	for(var i = 0;i < $scope.results.length; i++) {
  		if($scope.results[i]._id === drink.id){
  			$scope.results.splice(i,1)
  		} else {
<<<<<<< HEAD
  			console.log("Not this one "+ $scope.results[i]._id)
=======
  			console.log("Not this one "+ $scope.drinkMenu[i]._id)
>>>>>>> 56c4115d9157d1963b5559086ed314763146a035
  		}
  	};
  };

  $scope.removeFav = function(id) {
    console.log(id.drink._id);
    console.log(id.drink);
  	var   drinkId = {
  		id: id.drink._id.toString()
  	};
  	$http.delete('/favorites/' + id.drink._id)
  	.then(function(success) {
      $scope.deleteSuccess(id.drink.drink.title);
  		$scope.removeHTML(drinkId);
  	}, function(error) {
  		$scope.deleteFailure(id.drink.drink.title);
  		console.log(rejection.data);
  	});
  };

}]);

(function() {
/*! angular-flash - v2.2.5 - 2016-03-17
 * https://github.com/sachinchoolur/angular-flash
 * Copyright (c) 2016 Sachin; Licensed MIT */

'use strict';

var app = angular.module('ngFlash', []);

app.run(['$rootScope', function ($rootScope) {
    return $rootScope.flashes = [];
}]);

app.directive('dynamic', ['$compile', function ($compile) {
    return {
        restrict: 'A',
        replace: true,
        link: function link(scope, ele, attrs) {
            return scope.$watch(attrs.dynamic, function (html) {
                ele.html(html);
                return $compile(ele.contents())(scope);
            });
        }
    };
}]);

app.directive('closeFlash', ['$compile', '$rootScope', 'Flash', function ($compile, $rootScope, Flash) {
    return {
        link: function link(scope, ele, attrs) {
            return ele.on('click', function () {
                var id = parseInt(attrs.closeFlash, 10);
                Flash.dismiss(id);
                $rootScope.$apply();
            });
        }
    };
}]);

app.directive('flashMessage', ['Flash', function (Flash) {
    return {
        restrict: 'E',
        scope: {
            duration: '=',
            showClose: '=',
            onDismiss: '&'
        },
        template: '<div role="alert" ng-repeat="flash in $root.flashes track by $index" id="{{flash.config.id}}" class="alert {{flash.config.class}} alert-{{flash.type}} alert-dismissible alertIn alertOut"><div type="button" class="close" ng-show="flash.showClose" close-flash="{{flash.id}}"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></div> <span dynamic="flash.text"></span> </div>',
        link: function link(scope, ele, attrs) {
            Flash.setDefaultTimeout(scope.duration);
            Flash.setShowClose(scope.showClose);
            function onDismiss(flash) {
                if (typeof scope.onDismiss !== 'function') return;
                scope.onDismiss({ flash: flash });
            }

            Flash.setOnDismiss(onDismiss);
        }
    };
}]);

app.factory('Flash', ['$rootScope', '$timeout', function ($rootScope, $timeout) {
    var dataFactory = {};
    var counter = 0;
    dataFactory.setDefaultTimeout = function (timeout) {
        if (typeof timeout !== 'number') return;
        dataFactory.defaultTimeout = timeout;
    };

    dataFactory.defaultShowClose = true;
    dataFactory.setShowClose = function (value) {
        if (typeof value !== 'boolean') return;
        dataFactory.defaultShowClose = value;
    };
    dataFactory.setOnDismiss = function (callback) {
        if (typeof callback !== 'function') return;
        dataFactory.onDismiss = callback;
    };
    dataFactory.create = function (type, text, timeout, config, showClose) {
        var $this = undefined,
            flash = undefined;
        $this = this;
        flash = {
            type: type,
            text: text,
            config: config,
            id: counter++
        };
        flash.showClose = typeof showClose !== 'undefined' ? showClose : dataFactory.defaultShowClose;
        if (dataFactory.defaultTimeout && typeof timeout === 'undefined') {
            flash.timeout = dataFactory.defaultTimeout;
        } else if (timeout) {
            flash.timeout = timeout;
        }
        $rootScope.flashes.push(flash);
        if (flash.timeout) {
            flash.timeoutObj = $timeout(function () {
                $this.dismiss(flash.id);
            }, flash.timeout);
        }
        return flash.id;
    };
    dataFactory.pause = function (index) {
        if ($rootScope.flashes[index].timeoutObj) {
            $timeout.cancel($rootScope.flashes[index].timeoutObj);
        }
    };
    dataFactory.dismiss = function (id) {
        var index = findIndexById(id);
        if (index !== -1) {
            var flash = $rootScope.flashes[index];
            dataFactory.pause(index);
            $rootScope.flashes.splice(index, 1);
            $rootScope.$digest();
            if (typeof dataFactory.onDismiss === 'function') {
                dataFactory.onDismiss(flash);
            }
        }
    };
    dataFactory.clear = function () {
        while ($rootScope.flashes.length > 0) {
            dataFactory.dismiss($rootScope.flashes[0].id);
        }
    };
    dataFactory.reset = dataFactory.clear;
    function findIndexById(id) {
        return $rootScope.flashes.map(function(flash) {
            return flash.id;
        }).indexOf(id);
    }

    return dataFactory;
}]);
})()
