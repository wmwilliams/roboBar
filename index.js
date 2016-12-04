var express = require('express');
var bodyParser = require('body-parser');
var _ = require('lodash');
var path = require('path');
var mongoose = require('mongoose');
var five = require("johnny-five");
var expressJWT  = require('express-jwt');
// var board = new five.Board();
// var db = require('./server/models/index')
var sanitizeHtml = require('sanitize-html');
var jwt = require('jsonwebtoken');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var User = require('./server/models/user');
var Recipe = require('./server/models/drinks');
var secret = "luc143rforpresident";

//LOCAL database
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/barBot');

//execute server code on db connection
mongoose.connection.once('open', function(){
	console.log('SERVER/DB CONNECTED');

	app.use(bodyParser.json());
	  app.use(bodyParser.urlencoded({extended: false}));
	  app.use(express.static(path.join(__dirname, 'client')));
	  app.use('/api/users', require('./server/controllers/users'));
	  app.use('/api/users', expressJWT({secret: secret})
	  .unless({path: ['/api/users'], method: 'post'}));
	  app.use(function (err, req, res, next) {
	    if (err.name === 'UnauthorizedError') {
	      res.status(401).send({message: 'You need an authorization token to view this information.'})
	    }
	});
	app.post('/api/auth', function(req, res) {
		User.findOne({email: req.body.email}, function(err, user) {
		  if (err || !user) return res.send({message: 'User not found'});
		  user.authenticated(req.body.password, function(err, result) {
		    if (err || !result) return res.send({message: 'User not authenticated'});
		    // tokenName.push(user.name);
		    // users.push(user.name);
		    newUser = true;
		    var token = jwt.sign(user, secret);
		    tokenName = user.name;
		    res.send({user: user, token: token});
		  });
		});
	});

	app.post('/drinks', function(req, res) {
		// console.log(req.body)
		var newDrink = Recipe({
			title: req.body.title,
			description: req.body.description,
			img: req.body.img,
			extra: req.body.extra,
			ingredients: req.body.ingredients
		});
		newDrink.save(function(err) {
			if(err) console.log(err);
		})
	});

	//THIS IS A DELETE ROUTE --FUCK YOU ANGULAR
	app.post('/drinks/:id', function(req, res) {
		Recipe.findByIdAndRemove({_id : req.body.data}, function(err, recipe) {
			if(err || !recipe) console.log(err);
			console.log("Recipe deleted successfully.");
		})
	})




	io.sockets.on('connection', function(socket){
	  	console.log('SOCKETS CONNECTED');

		socket.on('news', function (data) {
		    console.log(data);
	  	});
	  	socket.on('drink', function(data) {
	  		// console.log(data);
	  		makeDrink(data);
	  	})

	});
	makeDrink = function(data) {
		console.log(data);
		console.log('Server making drink function');
	};

	var routes = require('./server/routes');
	_.each(routes, function(controller, route) {
		app.use(route, controller);
	});
	server.listen(process.env.PORT || 3000);
});