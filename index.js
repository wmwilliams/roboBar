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
var Favorite = require('./server/models/favorites');
var Report = require('./server/models/reports');
var Liquid = require('./server/models/usage');
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
				totalData.drinks = data
				res.send(totalData);
			});
		});

		app.post('/favorites', function(req, res) {
			var newFav = Favorite({
				user: req.body.user,
				drink: req.body.drink
			});
			Favorite.find({"user" : req.body.user, "drink._id" : req.body.drink._id}, function(err, data) {
				if(data[0]) {
					res.send('Failure')
				} else {
						console.log('This entry is NEW!')
						newFav.save(function(err) {
							if(err) console.log(err);
							console.log('SAVE SUCCESS');
							res.send("Success");
						})
				}
			})
		});

		app.get('/favorites/:id', function(req, res) {
			var totalFavs = {};
			console.log(req.params.id);
			Favorite.find({user : req.params.id}, function(err, data) {
				if(err) console.log(err);
				// console.log(data);
				totalFavs.drinks = data
				res.send(totalFavs);
			})
		})
		app.get('/drink-reports/:id', function(req, res) {
			var userReports = {};
			console.log(req.params.id);
			Report.find({user : req.params.id}, function(err, data) {
				if(err) console.log(err);
				// console.log(data);
				userReports.drinks = data
				res.send(userReports);
			})
		})
		app.get('/drink-reports', function(req, res) {
			var userReports = {};
			// console.log(req.params.id);
			Report.find({}, function(err, data) {
				if(err) console.log(err);
				// console.log(data);
				userReports.drinks = data
				res.send(userReports);
			})
		})
		app.delete('/drink-reports/:id', function(req, res) {
			console.log(req.params.id);
			var user = req.params.id.toString();
			Report.remove({'user' : user}, function(err) {
				if(err) console.log(err);
				res.send('Success');
			})
		})
		app.delete('/drink-reports/', function(req, res) {
			Report.remove({}, function(err) {
				if(err) console.log(err);
				res.send('Success');
			})
		})

		app.delete('/liquid-reports/:id', function(req, res) {
			console.log(req.params);
			Liquid.findOneAndRemove({name: req.params.id}, function(err, data) {
				if(err || !data) res.send(err);
				console.log('Bottle log removed');
				res.send('Success');
			})
		})

		app.get('/liquid-reports', function(req, res) {
			var liquidReports = {};
			Liquid.find({}, function(err, data) {
				if(err) console.log(err);
				liquidReports = data;
				console.log(liquidReports);
				res.send(liquidReports);
			})
		});

		app.post('/drinks', function(req, res) {
			console.log(req.body);
			var newDrink = Recipe({
				title: req.body.title,
				description: req.body.description,
				img: req.body.img,
				extra: req.body.extra,
				ingredients: req.body.ingredients
			});
			newDrink.save(function(err) {
				if(err) console.log(err);
				console.log('SAVE SUCCESS');
				res.send("Success");
			})
		});

		app.get('/drinks/:id', function(req, res) {
			var totalData = {};
			console.log(req.params.id);
			Recipe.findOne({_id : req.params.id}, function(err, data) {
				if(err) console.log(err);
				totalData.drinks = data;
				res.send(totalData);
			})
		});

		// app.put('/drinks/:id', function(req, res) {
		// 	var newDrink = Recipe({
		// 		title: req.body.title,
		// 		description: req.body.description,
		// 		img: req.body.img,
		// 		extra: req.body.extra,
		// 		ingredients: req.body.ingredients
		// 	});
		// 	Recipe.updateOne({_id : req.params.id}, newDrink,function(err, data) {
		// 		if (err) {
		// 			handleError(res, err.message, "Failed to update contact");
		// 		} else {
		// 			console.log(data);
		// 			res.send("Success");
		// 		}
		// 	})
		// });

		app.delete('/drinks/:id', function(req, res) {
			console.log('DELETE '+ req.params.id);
			Recipe.findByIdAndRemove({_id : req.params.id}, function(err, recipe) {
				if(err || !recipe) res.send(err);
				console.log("Recipe deleted successfully.");
				res.send('Success');
			})
		});
		app.delete('/favorites/:id', function(req, res) {
			console.log('DELETE '+ req.params.id);
			Favorite.findByIdAndRemove({_id : req.params.id}, function(err, recipe) {
				if(err || !recipe) res.send(err);
				console.log("Recipe deleted successfully.");
				res.send('Success');
			})
		});

		var gin = new five.Led(11);
		var tonic = new five.Led(9);
		var whiskey = new five.Led(13);

		io.sockets.on('connection', function(socket){
		  	console.log('SOCKETS CONNECTED')
		  	socket.on('drink', function(data) {
					console.log(checkPins());
					if(checkPins()) {
						socket.emit('message', {message : "failure"});
					} else if(!checkPins()) {
						socket.emit('message', {message : "success"});
						makeCalculation(data);
					}
				});
		});

		function checkPins() {
			var isbusy;
			for(var i = 0; i < board.pins.length; i++) {
				if('value' in board.pins[i]) {
					// console.log(board.pins[i].value)
					if(board.pins[i].value === 1) {
						isbusy = true;
						break;
					} else {
						isbusy = false;
					}
				}
			}
			return isbusy
		};

		function makeCalculation(data) {
			console.log("make calculation function");
			console.log(data.title);
			console.log(data.user);
			isBusy = true
			var alcoholTotal = 0;
			var mixerTotal = 0;
			var ingRates = {
				rate : '',
				ingredients : {}
			};
			var newReport = Report({
				user: data.user,
				drink: data.title,
			})
			newReport.save(function(err) {
				if(err) console.log(err);
				console.log('New-Report has been saved successfully.');
			});
			for(var stuff in data.drink.alcohol) {
				if(data.drink.alcohol[stuff]) {
					alcoholTotal = alcoholTotal + data.drink.alcohol[stuff];
					ingRates.ingredients[stuff] = data.drink.alcohol[stuff];
				}
			};
			for(var stuff in data.drink.mixer) {
				if(data.drink.mixer[stuff]) {
					mixerTotal = mixerTotal + data.drink.mixer[stuff];
					ingRates.ingredients[stuff] = data.drink.mixer[stuff];
				}
			};
			if(mixerTotal) {
				var liquidTotal = alcoholTotal + mixerTotal;
			} else {
				var liquidTotal = alcoholTotal;
			};
			ingRates.rate = 90000 / liquidTotal;
			console.log(ingRates);
			makeDrink(ingRates);
		};

		function makeDrink(drink) {
			console.log("makeDrink Function");
			var rate = drink.rate;
			console.log(drink);
			for(var ingredient in drink.ingredients) {
				checkIngredient(ingredient, drink.ingredients[ingredient], rate)
			};
		};

		function checkIngredient(ingredient, part, rate) {
			console.log('Check ingredient function');
			if(ingredient === "gin") {
				recordLiquids("gin", (part * rate));
				pumpMilliseconds(gin, (part * rate));
			} else if(ingredient === "tonic") {
				recordLiquids("tonic", (part * rate));
				pumpMilliseconds(tonic, (part * rate));
			} else if(ingredient === "whiskey") {
				recordLiquids("whiskey", (part * rate));
				pumpMilliseconds(whiskey, (part * rate));
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

		function recordLiquids(name, amount) {
			Liquid.findOneAndUpdate({'name' : name}, {$inc: {volume : (1.66 * (amount / 1000))}}, function(err, data) {
				if(data) {
					console.log(data)
				} else {
					var newLiquid = Liquid({
						name: name,
						volume: 1.66 * (amount / 1000)
					});
					console.log(newLiquid);
					newLiquid.save(function(err) {
						if(err) console.log(err);
						console.log('New Liquid Total!');
					})
			}
		});
	}

		var routes = require('./server/routes');
		_.each(routes, function(controller, route) {
			app.use(route, controller);
		});
		server.listen(process.env.PORT || 3001);
	});
});
