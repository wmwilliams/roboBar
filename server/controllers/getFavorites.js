var express = require('express');
var router = express.Router();
var db = require('../models/index');

var favData = {};


router.get('/', function(req, res){
	db.Favorites.find({}, function(err, data){
		if(err) console.log(err);
		totalData.drinks = data;
		res.send(favData);
	});
})

module.exports = router;