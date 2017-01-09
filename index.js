var express = require('express');
var bodyParser = require('body-parser');
var _ = require('lodash');
var path = require('path');
var mongoose = require('mongoose');
var five = require("johnny-five");
var expressJWT  = require('express-jwt');
var board = new five.Board();
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
	board.on("ready", function() {
		console.log('Board Connected');

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
	//Database routes
		function handleError(res, reason, message, code) {
			console.log("ERROR: " + reason);
			res.status(code || 500).json({"error": message});
		};
		
		app.post('/api/auth', function(req, res) {
			console.log('node Auth Post');
			User.findOne({email: req.body.email}, function(err, user) {
			  if (err || !user) return res.send({message: 'User not found'});
			  user.authenticated(req.body.password, function(err, result) {
			    if (err || !result) return res.send({message: 'User not authenticated'});
			    newUser = true;
			    var token = jwt.sign(user, secret);
			    tokenName = user.name;
			    console.log({user: user, token: token});
			    res.send({user: user, token: token});
			  });
			});
		});

		app.get('/drinks', function(req, res) {
			var totalData = {};
			Recipe.find({}, function(err, data){
				if(err) console.log(err);
				totalData.drinks = data;
				// console.log(data + "INDEXjs ROUTE");
				res.send(totalData);
			});
		});

		app.post('/drinks', function(req, res) {
			console.log(req.body.data);
			var newDrink = Recipe({
				title: req.body.data.title,
				description: req.body.data.description,
				img: req.body.data.img,
				extra: req.body.data.extra,
				ingredients: req.body.data.ingredients
			});
			newDrink.save(function(err) {
				if(err) console.log(err);
			})
		});

		app.get('/drinks/:id', function(req, res) {
			var totalData = {};
			console.log(req.params.id);
			Recipe.findOne({_id : req.params.id}, function(err, data) {
				if(err) console.log(err);
				totalData.drinks = data;
				res.send(totalData);
				console.log(totalData);
			})
		});

		app.put('/drinks/:id', function(req, res) {
			var newDrink = Recipe({
				title: req.body.title,
				description: req.body.description,
				img: req.body.img,
				extra: req.body.extra,
				ingredients: req.body.ingredients
			});
			Recipe.updateOne({_id : req.params.id}, newDrink,function(err, data) {
				if (err) {
					handleError(res, err.message, "Failed to update contact");
				} else {
					console.log(data);
					res.status(204).end();
				}
			})
		});

		app.delete('/drinks/:id', function(req, res) {	
			console.log('DELETE '+ req.params.id);
			Recipe.findByIdAndRemove({_id : req.params.id}, function(err, recipe) {
				if(err || !recipe) console.log(err);
				console.log("Recipe deleted successfully.");
			})	
		});

		var gin = new five.Led(11);
		var tonic = new five.Led(9);
		var whiskey = new five.Led(8);

		var isBusy = false;
		io.sockets.on('connection', function(socket){
		  	console.log('SOCKETS CONNECTED');

		  	socket.on('drink', function(data) {
		  		if(isBusy) {
		  			console.log('DRINK ROBOT IS BUSY');
		  		}
		  		else { makeCalculation(data); }
		  	})

		});

		function makeCalculation(data) {
			isBusy = true;
			console.log('Server making drink function ' + isBusy);
			var alcoholTotal = 0;
			var mixerTotal = 0;
			var ingRates = {
				rate : '',
				ingredients : {}
			};
			for(var stuff in data.alcohol) {
				if(data.alcohol[stuff]) {
					alcoholTotal = alcoholTotal + data.alcohol[stuff];
					ingRates.ingredients[stuff] = data.alcohol[stuff];
				}
			};	

			for(var stuff in data.mixer) {
				if(data.mixer[stuff]) {
					mixerTotal = mixerTotal + data.mixer[stuff];
					ingRates.ingredients[stuff] = data.mixer[stuff];
				}
			};
			if(mixerTotal) {
				var liquidTotal = alcoholTotal + mixerTotal;
			} else {
				var liquidTotal = alcoholTotal;
			};
			ingRates.rate = 90000 / liquidTotal;
			makeDrink(ingRates);
		};

		function makeDrink(drink) {
			console.log(drink);
			var rate = drink.rate;

			for(var ingredient in drink.ingredients) {
				console.log(drink.ingredients[ingredient]);
				checkIngredient(ingredient, drink.ingredients[ingredient], rate);
			};
			isBusy = false;
		};

		function checkIngredient(ingredient, part, rate) {
			if(ingredient === "gin") {
				console.log(ingredient);
				pumpMilliseconds(gin, (part * rate));
			} else if(ingredient === "tonic") {
				console.log(ingredient);
				pumpMilliseconds(tonic, (part * rate));
			} else if(ingredient === "whiskey") {
				console.log(ingredient);
				pumpMilliseconds(tonic, (part * rate));
			}
		};

		function pumpMilliseconds(pump, ms) {
			startPump(pump)
			setTimeout(function () {
				stopPump(pump);
			}, ms);
		};
		function startPump(pump) {
			pump.on();
		};
		function stopPump(pump) {
			pump.off();
		};

		var routes = require('./server/routes');
		_.each(routes, function(controller, route) {
			app.use(route, controller);
		});
		server.listen(process.env.PORT || 3000);
	});
});