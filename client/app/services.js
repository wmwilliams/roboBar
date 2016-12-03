angular.module('BarServices', ['ngResource'])
.factory('Auth',['$window', function($window){
	return {
		saveToken: function(token) {
			$window.localStorage['$authtoken'] = token;
		},
		getToken: function() {
			return $window.localStorage['$authtoken']
		},
		removeToken: function() {
			$window.localStorage.removeItem('$authtoken');
		},
		isLoggedIn: function() {
			var token = this.getToken();
			return token ? true : false
		},
		currentUser: function() {
			if(this.isLoggedIn()) {
				var token = this.getToken();
				try {
					var payload = JSON.parse($window.atob(token.split('.')[1]));
					return payload
				} catch(err) {
					return false;
				}
			}
		}
	}
}])
.factory('AuthInterceptor', ['Auth', function(Auth) {
	return {
		request: function(config) {
			var token = Auth.getToken();
			if(token) {
				config.headers.Authorization = 'Bearer' + token;
			}
			return config
		}
	}
}])
.factory('Alerts', [function() {
	var alerts = [];
	return {
		clear: function() {
			alerts = []
		},
		add: function(type, msg) {
			alerts.push({type: type, msg: msg});
		},
		get: function() {
			return alerts;
		},
		remove: function(idx) {
			alerts.splice(idx, 1);
		}
	}
}])
.factory('AllData', ['$resource', function($resource) {
	return $resource('http://localhost:3000/getall');
}])





